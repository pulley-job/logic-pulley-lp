/**
 * SetupService - スプレッドシート初期設定
 * 
 * このファイルは初期セットアップ用です。
 * GASエディタで initializeSpreadsheet() を実行してください。
 */

/**
 * マスタースプレッドシートを初期化
 * メニューから実行するか、エディタから直接実行
 */
function initializeSpreadsheet() {
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

    if (!spreadsheetId) {
        throw new Error('SPREADSHEET_ID が設定されていません。プロジェクト設定でスクリプトプロパティを追加してください。');
    }

    const ss = SpreadsheetApp.openById(spreadsheetId);

    // 問題マスターシートの初期化
    initializeQuestionsSheet(ss);

    // カテゴリマスターシートの初期化
    initializeCategorySheet(ss);

    SpreadsheetApp.getUi().alert('初期化が完了しました！');
}

/**
 * 問題マスターシートを初期化
 */
function initializeQuestionsSheet(ss) {
    let sheet = ss.getSheetByName('問題マスター');

    if (!sheet) {
        sheet = ss.insertSheet('問題マスター');
    }

    // ヘッダー
    const headers = [
        '問題ID',
        '年度',
        '回数',
        '時間帯',
        '問題番号',
        '大分類',
        '中分類',
        '小分類',
        '問題文',
        '画像URL',
        '選択肢1',
        '選択肢2',
        '選択肢3',
        '選択肢4',
        '選択肢5',
        '正解番号',
        '解説テキスト',
        '自作問題フラグ',
        '難易度',
        '登録日時',
        '更新日時'
    ];

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground('#4a90d9');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');

    // 列幅調整
    sheet.setColumnWidth(1, 100);  // 問題ID
    sheet.setColumnWidth(2, 60);   // 年度
    sheet.setColumnWidth(3, 80);   // 回数
    sheet.setColumnWidth(4, 70);   // 時間帯
    sheet.setColumnWidth(5, 80);   // 問題番号
    sheet.setColumnWidth(6, 80);   // 大分類
    sheet.setColumnWidth(7, 120);  // 中分類
    sheet.setColumnWidth(8, 180);  // 小分類
    sheet.setColumnWidth(9, 400);  // 問題文
    sheet.setColumnWidth(10, 200); // 画像URL
    sheet.setColumnWidth(11, 200); // 選択肢1
    sheet.setColumnWidth(12, 200); // 選択肢2
    sheet.setColumnWidth(13, 200); // 選択肢3
    sheet.setColumnWidth(14, 200); // 選択肢4
    sheet.setColumnWidth(15, 200); // 選択肢5
    sheet.setColumnWidth(16, 80);  // 正解番号
    sheet.setColumnWidth(17, 400); // 解説テキスト
    sheet.setColumnWidth(18, 100); // 自作問題フラグ
    sheet.setColumnWidth(19, 70);  // 難易度
    sheet.setColumnWidth(20, 140); // 登録日時
    sheet.setColumnWidth(21, 140); // 更新日時

    // 入力規則
    // 時間帯
    sheet.getRange(2, 4, 1000, 1).setDataValidation(
        SpreadsheetApp.newDataValidation()
            .requireValueInList(['AM', 'PM'])
            .build()
    );

    // 大分類
    sheet.getRange(2, 6, 1000, 1).setDataValidation(
        SpreadsheetApp.newDataValidation()
            .requireValueInList(['実地', '専門', '基礎'])
            .build()
    );

    // 中分類
    sheet.getRange(2, 7, 1000, 1).setDataValidation(
        SpreadsheetApp.newDataValidation()
            .requireValueInList(['運動器', '中枢', '評価', '内部', '運動学', '精神/心理', 'その他'])
            .build()
    );

    // 難易度
    sheet.getRange(2, 19, 1000, 1).setDataValidation(
        SpreadsheetApp.newDataValidation()
            .requireValueInList(['A', 'B', 'C'])
            .build()
    );

    // ヘッダー行を固定
    sheet.setFrozenRows(1);
}

/**
 * カテゴリマスターシートを初期化
 */
function initializeCategorySheet(ss) {
    let sheet = ss.getSheetByName('カテゴリマスター');

    if (!sheet) {
        sheet = ss.insertSheet('カテゴリマスター');
    }

    // ヘッダー
    const headers = ['大分類', '中分類', '小分類'];
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground('#28a745');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');

    // カテゴリデータ
    const categoryData = [
        // 運動器
        ['実地', '運動器', '脊髄損傷'],
        ['実地', '運動器', '運動療法（概論）'],
        ['実地', '運動器', '末梢神経障害'],
        ['実地', '運動器', '脊椎疾患・熱傷・変形性関節症'],
        ['実地', '運動器', 'リウマチ'],
        ['実地', '運動器', 'スポーツ外傷'],
        ['実地', '運動器', '画像評価・整形外科的テスト'],

        // 中枢
        ['実地', '中枢', '脳基礎'],
        ['実地', '中枢', '頭部外傷'],
        ['実地', '中枢', '難病'],
        ['実地', '中枢', '伝導路・脳画像'],
        ['実地', '中枢', '理学療法・視聴覚・ALS・評価・高次脳'],
        ['実地', '中枢', '神経基礎'],
        ['実地', '中枢', '自律神経'],
        ['実地', '中枢', '脳血管'],
        ['実地', '中枢', '小脳'],
        ['実地', '中枢', '多発性硬化症'],
        ['実地', '中枢', '嚥下'],
        ['実地', '中枢', 'パーキンソン病・肩手症候群・ポストポリオ'],

        // 評価
        ['実地', '評価', '関節可動域検査'],
        ['実地', '評価', '徒手筋力検査'],
        ['実地', '評価', '感覚検査'],
        ['実地', '評価', '反射検査'],
        ['実地', '評価', '疼痛検査'],
        ['実地', '評価', '形態測定'],
        ['実地', '評価', 'バランス検査'],

        // 内部
        ['実地', '内部', '肝臓・膵臓・胆嚢・病理'],
        ['実地', '内部', '血液～免疫と疾患'],
        ['実地', '内部', 'DM・運動生理・代謝・体温・腎臓'],
        ['実地', '内部', '心臓の解剖・循環生理・心電図・心疾患・PAD/大血管疾患'],
        ['実地', '内部', '呼吸解剖・生理'],
        ['実地', '内部', '呼吸器機能検査'],
        ['実地', '内部', '呼吸器疾患'],
        ['実地', '内部', '排便尿'],
        ['実地', '内部', 'がんリハ'],
        ['実地', '内部', '内分泌'],
        ['実地', '内部', '内分泌疾患'],
        ['実地', '内部', '細胞器官'],
        ['実地', '内部', '生殖器'],
        ['実地', '内部', '消化器'],
        ['実地', '内部', '老年症候群'],
        ['実地', '内部', 'フレイル'],
        ['実地', '内部', '薬理'],

        // 運動学
        ['実地', '運動学', '骨・関節'],
        ['実地', '運動学', '運動学（上肢・下肢）'],
        ['実地', '運動学', '基本動作'],
        ['実地', '運動学', '姿勢・歩行'],
        ['実地', '運動学', '筋生理'],
        ['実地', '運動学', '筋の（付着）起始・停止'],
        ['実地', '運動学', '支配神経'],

        // その他
        ['実地', 'その他', '義肢'],
        ['実地', 'その他', '装具'],
        ['実地', 'その他', '物療'],
        ['実地', 'その他', 'ADL'],
        ['実地', 'その他', '小児'],
        ['実地', 'その他', 'リハ概論'],

        // 専門（同様の構造）
        ['専門', '運動器', ''],
        ['専門', '中枢', ''],
        ['専門', '評価', ''],
        ['専門', '内部', ''],
        ['専門', '運動学', ''],
        ['専門', '精神/心理', ''],
        ['専門', 'その他', ''],

        // 基礎（同様の構造）
        ['基礎', '運動器', ''],
        ['基礎', '中枢', ''],
        ['基礎', '評価', ''],
        ['基礎', '内部', ''],
        ['基礎', '運動学', ''],
        ['基礎', '精神/心理', ''],
        ['基礎', 'その他', '']
    ];

    if (categoryData.length > 0) {
        sheet.getRange(2, 1, categoryData.length, 3).setValues(categoryData);
    }

    // 列幅調整
    sheet.setColumnWidth(1, 100);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 250);

    // ヘッダー行を固定
    sheet.setFrozenRows(1);
}

/**
 * メニューに初期化オプションを追加
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('国試夢想DB')
        .addItem('スプレッドシートを初期化', 'initializeSpreadsheet')
        .addToUi();
}
