/**
 * ■ 設定エリア
 */
// Looker StudioのレポートURL (編集画面のURLではなく、閲覧用URL)
// 末尾が /page/xxxx で終わる形式がベストです
const LOOKER_STUDIO_BASE_URL = 'https://lookerstudio.google.com/reporting/b1dd8f34-872b-401e-8d42-4593b37cbc96';

// ★最重要: Looker Studioの「URLの埋め込みパラメータを管理」で設定したパラメータ名
// 手順: リソース > URLの埋め込みパラメータを管理 > 追加 > 名前「sid」, ソース「ID」
const LOOKER_FIELD_ID = 'sid';

const GEMINI_API_KEY = 'AIzaSyBcaBEtF61EOYq_cAEigaTGWdPe7GLmuNg';

function doGet() {
    return HtmlService.createTemplateFromFile('index')
        .evaluate().setTitle('成績管理・通知システム')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 機能1: Excelデータ登録 
 * (MasterDBへの蓄積 + 個別シートへの振り分け + StudentList更新)
 */
function processExcelUpload(formObject) {
    try {
        const blob = formObject.fileData;
        const examName = formObject.examName;
        const examDate = formObject.examDate;

        // 1. ファイル読み込み (CSV対応版)
        let data = [];
        const fileName = formObject.fileData.name.toLowerCase();
        const isCsv = fileName.endsWith('.csv') || formObject.fileData.contentType === 'text/csv';

        if (isCsv) {
            // CSVの場合
            try {
                const csvText = blob.getDataAsString('UTF-8');
                data = Utilities.parseCsv(csvText);
            } catch (e) {
                // Shift-JISトライ
                const csvText = blob.getDataAsString('Shift_JIS');
                data = Utilities.parseCsv(csvText);
            }
        } else {
            // Excelの場合
            const resource = { title: 'Temp', mimeType: MimeType.GOOGLE_SHEETS };
            const tempFile = Drive.Files.insert(resource, blob, { convert: true });
            const tempSs = SpreadsheetApp.openById(tempFile.id);
            data = tempSs.getSheets()[0].getDataRange().getValues();
            Drive.Files.remove(tempFile.id);
        }

        // 2. データの整形
        const dbRecords = [];
        const timestamp = new Date();
        const headers = data[0];
        // テンプレート(5列目が保護者Mail)なので、科目(点数)は6列目(index 5)から
        const subjects = headers.slice(5);

        // 個別シート振り分け用のマップ { "学生ID": [レコード配列] }
        const studentDataMap = {};

        // StudentList更新用データ準備
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let stSheet = ss.getSheetByName('StudentList');
        if (!stSheet) {
            stSheet = ss.insertSheet('StudentList');
            stSheet.appendRow(['クラス', 'ID', '氏名', '学生Mail', '保護者Mail', 'SecretKey', 'URL']);
        }
        const stData = stSheet.getDataRange().getValues();
        const stMap = {};
        for (let i = 1; i < stData.length; i++) {
            stMap[String(stData[i][1])] = i + 1;
        }

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row[1]) continue; // IDがない行はスキップ

            const studentId = String(row[1]);
            const studentName = row[2];
            const className = row[0];
            const sMail = row[3];
            const pMail = row[4];

            // A. StudentListの更新・新規登録
            if (stMap[studentId]) {
                const rowNum = stMap[studentId];
                stSheet.getRange(rowNum, 1, 1, 5).setValues([[className, studentId, studentName, sMail, pMail]]);
            } else {
                stSheet.appendRow([className, studentId, studentName, sMail, pMail, "", ""]);
                stMap[studentId] = stSheet.getLastRow();
            }

            // B. 個別シート用データ構築
            if (!studentDataMap[studentId]) {
                studentDataMap[studentId] = {
                    name: studentName,
                    className: className,
                    records: []
                };
            }

            // C. MasterDB用データ構築
            for (let j = 0; j < subjects.length; j++) {
                const score = row[5 + j];
                if (score !== "" && score != null) {
                    dbRecords.push([className, studentId, studentName, examName, examDate, subjects[j], score, "", timestamp]);
                    studentDataMap[studentId].records.push([examName, examDate, subjects[j], score]);
                }
            }
        }

        // 3. MasterDBへの保存
        let sheet = ss.getSheetByName('MasterDB');
        if (!sheet) {
            sheet = ss.insertSheet('MasterDB');
            sheet.appendRow(['クラス', 'ID', '氏名', '試験名', '実施日', '科目', '点数', 'コメント', '登録日時']);
        }
        if (dbRecords.length > 0) {
            sheet.getRange(sheet.getLastRow() + 1, 1, dbRecords.length, 9).setValues(dbRecords);
        }

        // 4. 個別スプレッドシートへの保存
        const folderUrl = PropertiesService.getScriptProperties().getProperty('STUDENT_FOLDER_URL');
        let distributeMsg = "";
        if (folderUrl) {
            const count = distributeToIndividualSheets(studentDataMap, folderUrl);
            distributeMsg = `\n(個別シート ${count}件 更新完了)`;
        } else {
            distributeMsg = `\n※保存先フォルダ未設定のため個別シートは作成されませんでした`;
        }

        updateSecretKeys(); // URL生成 & StudentListの未設定項目補完
        return { success: true, message: `${dbRecords.length} 件登録完了\n名簿情報も更新しました${distributeMsg}` };
    } catch (e) {
        return { success: false, message: 'エラー: ' + e.toString() };
    }
}

/**
 * 新機能: 個別スプレッドシートへの振り分け保存
 */
function distributeToIndividualSheets(studentDataMap, folderUrl) {
    let updatedCount = 0;
    try {
        const folderId = folderUrl.match(/[-\w]{25,}/)[0];
        const folder = DriveApp.getFolderById(folderId);

        // 既存のファイルを全取得してMapにする (ファイル名: ID_氏名 という形式を想定)
        const files = folder.getFiles();
        const fileMap = {}; // { "StudentId": FileObject }
        while (files.hasNext()) {
            const f = files.next();
            // ファイル名からIDを抽出 (例: "2024001_山田太郎" -> "2024001")
            const fname = f.getName();
            const extractedId = fname.split('_')[0];
            if (extractedId) fileMap[extractedId] = f;
        }

        // 生徒ごとに処理
        for (const [id, data] of Object.entries(studentDataMap)) {
            let indSheet;

            if (fileMap[id]) {
                // 既存ファイルがある場合
                const indSs = SpreadsheetApp.open(fileMap[id]);
                indSheet = indSs.getSheets()[0];
            } else {
                // 新規作成
                const newFileName = `${id}_${data.name}`;
                const newSs = SpreadsheetApp.create(newFileName);
                const newFile = DriveApp.getFileById(newSs.getId());
                newFile.moveTo(folder); // 指定フォルダに移動

                indSheet = newSs.getSheets()[0];
                indSheet.appendRow(['試験名', '実施日', '科目', '点数']); // ヘッダー
                indSheet.setFrozenRows(1);
            }

            // データ追記
            if (data.records.length > 0) {
                indSheet.getRange(indSheet.getLastRow() + 1, 1, data.records.length, 4).setValues(data.records);
            }
            updatedCount++;
        }
    } catch (e) {
        console.log("個別シート作成エラー: " + e.toString());
    }
    return updatedCount;
}

/**
 * 設定保存: 個別シート保存先フォルダ設定
 */
function saveSettings(folderUrl) {
    PropertiesService.getScriptProperties().setProperty('STUDENT_FOLDER_URL', folderUrl);
    return { success: true, message: '設定を保存しました' };
}

function getSettings() {
    return {
        folderUrl: PropertiesService.getScriptProperties().getProperty('STUDENT_FOLDER_URL') || ''
    };
}


/**
 * 機能2: SecretKey & Linking API URL更新 (ここが心臓部)
 */
function updateSecretKeys() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('StudentList');
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const range = sheet.getRange(2, 1, lastRow - 1, 7);
    const data = range.getValues();
    let isUpdated = false;

    const updatedData = data.map(row => {
        // F列: SecretKey生成
        if (!row[5]) {
            row[5] = Utilities.getUuid();
            isUpdated = true;
        }

        // G列: Linking API URL生成 (フィルタ付き)
        // ID (B列: row[1]) を文字列としてパラメータ化 (Looker Studioフィルタ対応)
        if (!row[6] || row[6].indexOf(`"${LOOKER_FIELD_ID}"`) === -1) {
            const params = {};
            // 重要: 文字列化してフィルタを確実にする
            params[LOOKER_FIELD_ID] = String(row[1]);

            const jsonParams = JSON.stringify(params);
            const separator = LOOKER_STUDIO_BASE_URL.includes('?') ? '&' : '?';
            row[6] = `${LOOKER_STUDIO_BASE_URL}${separator}params=${encodeURIComponent(jsonParams)}`;
            isUpdated = true;
        }
        return row;
    });

    if (isUpdated) range.setValues(updatedData);
}

/**
 * 機能3: データ取得
 */
function getStudentEmailList() {
    updateSecretKeys();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('StudentList');
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
    return data.map(row => ({
        className: row[0], id: row[1], name: row[2], email: row[3], parentEmail: row[4], url: row[6]
    }));
}

/**
 * 機能4: AI文章作成
 */
function refineTextWithAI(data) {
    if (!GEMINI_API_KEY) return "APIキー設定エラー";

    let prompt = "";
    if (data.mode === 'template') {
        prompt = `あなたは理学療法士養成校の教員です。教務システムで使う「文章テンプレート」を作成してください。
用途：${data.type} (メール通知 または 成績表コメント)
テーマ：${data.instruction}
出力：本文のみ（宛名不要）`;
    } else {
        prompt = `あなたは理学療法士養成校の教員です。成績表の「担任コメント」を作成してください。
学生：${data.name}
メモ：${data.instruction}
出力：コメント本文のみ（宛名不要、ですます調）`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    try {
        const res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload) });
        return JSON.parse(res.getContentText()).candidates[0].content.parts[0].text;
    } catch (e) { return "AIエラー: " + e.toString(); }
}

/**
 * 機能5: テンプレート管理
 */
function getAllTemplates() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('TemplateDB');
    if (!sheet) return [];
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    return sheet.getRange(2, 1, lastRow - 1, 4).getValues().map((r, i) => ({
        id: i, type: r[0], name: r[1], subject: r[2], body: r[3]
    }));
}

function saveTemplate(data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('TemplateDB');
    if (!sheet) { sheet = ss.insertSheet('TemplateDB'); sheet.appendRow(['種類', 'テンプレート名', '件名', '本文']); }

    if (data.action === 'add') {
        sheet.appendRow([data.type, data.name, data.subject, data.body]);
    } else if (data.action === 'edit') {
        sheet.getRange(data.id + 2, 1, 1, 4).setValues([[data.type, data.name, data.subject, data.body]]);
    } else if (data.action === 'delete') {
        sheet.deleteRow(data.id + 2);
    }
    return getAllTemplates();
}

/**
 * 機能6: 送信 & 保存
 */
function sendBatchEmails(list, examName) {
    let count = 0;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dbSheet = ss.getSheetByName('MasterDB');
    const dbData = dbSheet.getDataRange().getValues();

    const rowMap = {};
    for (let i = 1; i < dbData.length; i++) {
        const key = `${dbData[i][1]}_${dbData[i][3]}`;
        if (!rowMap[key]) rowMap[key] = [];
        rowMap[key].push(i + 1);
    }

    list.forEach(d => {
        if (d.email && d.email.includes('@')) {
            try {
                const options = {};
                if (d.parentEmail && d.parentEmail.includes('@')) options.cc = d.parentEmail;
                GmailApp.sendEmail(d.email, d.subject, d.body, options);
                count++;
            } catch (e) { console.log("送信エラー:" + d.name); }
        }
        if (examName) {
            const targetKey = `${d.id}_${examName}`;
            const rows = rowMap[targetKey];
            if (rows) rows.forEach(r => dbSheet.getRange(r, 8).setValue(d.reportComment));
        }
    });
    return { success: true, message: `${count}件 送信完了` };
}

/**
 * 機能7: PDF作成 (QRコード修正・堅牢化版)
 */
function createPDFBundle(list, examName) {
    const folder = DriveApp.createFolder(`${examName}_成績表_${Utilities.formatDate(new Date(), "JST", "yyyyMMdd_HHmm")}`);
    let count = 0;

    const templateHtml = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
          .info-table td { padding: 8px; font-size: 14px; border-bottom: 1px solid #eee; }
          .qr-box { text-align: center; border: 1px solid #ccc; padding: 15px; margin: 20px 0; border-radius: 8px; }
          .qr-note { font-size: 12px; margin-bottom: 10px; color: #555; }
          .url-sub { font-size: 9px; color: #aaa; word-break: break-all; margin-top: 5px; }
          .comment-box { border: 1px solid #333; padding: 15px; background-color: #f9f9f9; min-height: 100px; }
          .footer { margin-top: 40px; text-align: right; font-size: 11px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header"><div class="title">模擬試験 成績通知書</div></div>
        <table class="info-table">
          <tr><td><strong>試験名：</strong> {{EXAM_NAME}}</td><td><strong>クラス：</strong> {{CLASS}}</td></tr>
          <tr><td colspan="2"><strong>氏名：</strong> {{NAME}} (ID: {{ID}})</td></tr>
        </table>
        
        <div class="qr-box">
          <p class="qr-note">以下のQRコードを読み取り、詳細な成績をご確認ください。</p>
          {{QR_CODE_IMG}}
          <div class="url-sub">URL: {{URL}}</div>
        </div>

        <div class="comment-box">
          <p><strong>【担任からのコメント】</strong></p>
          <p>{{COMMENT}}</p>
        </div>

        <div class="footer">発行日：{{DATE}} | 理学療法学科 教務課</div>
      </body>
    </html>
  `;

    list.forEach(d => {
        let imgTag = "";
        try {
            // 安定しているQRサーバーを使用
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(d.url)}`;
            // 通信エラー対策: 失敗したらテキスト表示にする
            const response = UrlFetchApp.fetch(qrUrl, { muteHttpExceptions: true });
            if (response.getResponseCode() === 200) {
                const qrBase64 = Utilities.base64Encode(response.getBlob().getBytes());
                imgTag = `<img src="data:image/png;base64,${qrBase64}" width="150" height="150" />`;
            } else {
                imgTag = "<p style='color:red'>[QR取得失敗]</p>";
            }
        } catch (e) {
            imgTag = "<p style='color:red'>[QR生成エラー]</p>";
        }

        let html = templateHtml
            .replace('{{EXAM_NAME}}', examName)
            .replace('{{NAME}}', d.name)
            .replace('{{ID}}', d.id)
            .replace('{{CLASS}}', d.className)
            .replace('{{URL}}', d.url)
            .replace('{{QR_CODE_IMG}}', imgTag)
            .replace('{{COMMENT}}', (d.reportComment || "なし").replace(/\n/g, '<br>'))
            .replace('{{DATE}}', Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd"));

        const blob = Utilities.newBlob(html, MimeType.HTML).getAs(MimeType.PDF);
        blob.setName(`${d.className}_${d.name}.pdf`);
        folder.createFile(blob);
        count++;

        // 連続アクセス制限回避のための待機
        Utilities.sleep(200);
    });

    return { success: true, message: `${count}件のPDFを作成しました。\nGoogleドライブを確認してください。`, url: folder.getUrl() };
}
