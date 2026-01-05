/**
 * デモデータ作成用スクリプト
 * ルール:
 * 1. ユーザーのAPIキーを使用せず、すべてローカルで生成されたデモデータを使用します。
 * 2. データはGoogleスプレッドシートに格納されます。
 * 3. Looker Studioでの可視化を前提としたカラム構成です。
 * 
 * 実行方法:
 * エディタのツールバーから「main」関数を選択し、「実行」をクリックしてください。
 */

// Looker Studio設定
const LOOKER_STUDIO_BASE_URL = 'https://lookerstudio.google.com/reporting/b1dd8f34-872b-401e-8d42-4593b37cbc96';
const LOOKER_FIELD_ID = 'sid';

/**
 * 実行用メイン関数
 */
function main() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. シートの初期化 setup
    const studentSheet = setupSheet(ss, 'StudentList', ['クラス', 'ID', '氏名', '学生Mail', '保護者Mail', 'SecretKey', 'URL']);
    const masterSheet = setupSheet(ss, 'MasterDB', ['クラス', 'ID', '氏名', '試験名', '実施日', '科目', '点数', 'コメント', '登録日時']);

    // 2. 学生デモデータの生成 generate
    // 50人の学生データを生成
    const students = generateDemoStudents(50);

    // 3. 学生データの書き込み & URL生成
    saveStudents(studentSheet, students);

    // 4. 試験結果デモデータの生成 generate
    // 過去4回分の模試データを作成
    const examResults = generateExamResults(students);

    // 5. 試験結果の書き込み
    saveExamResults(masterSheet, examResults);

    // 完了通知
    const url = ss.getUrl();
    console.log('デモデータ作成完了');
    console.log(`Spreadsheet URL: ${url}`);
    Browser.msgBox(`デモデータの作成が完了しました。\\nLooker Studioでデータを更新してください。`);
}

/**
 * シートのセットアップ（存在を確認し、なければ作成、あればクリア）
 */
function setupSheet(ss, sheetName, headers) {
    let sheet = ss.getSheetByName(sheetName);
    if (sheet) {
        sheet.clear();
    } else {
        sheet = ss.insertSheet(sheetName);
    }
    sheet.appendRow(headers);
    return sheet;
}

/**
 * 学生デモデータの生成
 */
function generateDemoStudents(count) {
    const students = [];
    const classNames = ['Aクラス', 'Bクラス'];

    for (let i = 0; i < count; i++) {
        const id = 24001 + i;
        const cls = classNames[i % 2];
        const lastName = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'][Math.floor(Math.random() * 10)];
        const firstName = ['太郎', '次郎', '花子', '愛', '健太', '美咲', '翔', 'さくら', '大輔', '優'][Math.floor(Math.random() * 10)];

        students.push({
            className: cls,
            id: String(id),
            name: `${lastName} ${firstName}`,
            email: `student${id}@example.com`,
            parentEmail: `parent${id}@example.com`
        });
    }
    return students;
}

/**
 * 学生データの保存とURL生成
 */
function saveStudents(sheet, students) {
    const rows = students.map(s => {
        // SecretKey生成
        const secretKey = Utilities.getUuid();

        // Looker Studio URL生成 (sidパラメータ付与)
        const params = {};
        params[LOOKER_FIELD_ID] = s.id;
        const jsonParams = JSON.stringify(params);
        const separator = LOOKER_STUDIO_BASE_URL.includes('?') ? '&' : '?';
        const url = `${LOOKER_STUDIO_BASE_URL}${separator}params=${encodeURIComponent(jsonParams)}`;

        return [s.className, s.id, s.name, s.email, s.parentEmail, secretKey, url];
    });

    if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, 7).setValues(rows);
    }
}

/**
 * 試験結果データの生成
 */
function generateExamResults(students) {
    const results = [];
    const subjects = ['解剖学', '生理学', '運動学', '病理学', '臨床心理学', 'リハビリテーション概論'];
    const exams = [
        { name: '第1回 模擬試験', date: '2024/05/15' },
        { name: '第2回 模擬試験', date: '2024/07/20' },
        { name: '第3回 模擬試験', date: '2024/09/10' },
        { name: '第4回 模擬試験', date: '2024/11/05' }
    ];

    const timestamp = new Date();

    students.forEach(s => {
        exams.forEach(ex => {
            subjects.forEach(sub => {
                // 点数をランダム生成 (平均60, 標準偏差15程度の分布を簡易再現)
                let score = Math.floor(Math.random() * 40) + 40 + (s.className === 'Aクラス' ? 5 : 0);
                score = Math.min(100, Math.max(0, score)); // 0-100範囲制限

                let comment = "";
                if (score < 40) comment = "補習が必要です。";
                else if (score > 80) comment = "素晴らしい成績です！";
                else comment = "よく頑張りました。";

                results.push([
                    s.className,
                    s.id,
                    s.name,
                    ex.name,
                    ex.date,
                    sub,
                    score,
                    comment,
                    timestamp
                ]);
            });
        });
    });

    return results;
}

/**
 * 試験結果の保尊
 */
function saveExamResults(sheet, results) {
    if (results.length > 0) {
        // データ量が多い場合の分割書き込み考慮も可能だが、今回は一括
        sheet.getRange(2, 1, results.length, 9).setValues(results);
    }
}
