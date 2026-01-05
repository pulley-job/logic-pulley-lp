/**
 * 第59回理学療法士国家試験（午前）問題をDBに追加するスクリプト
 * 
 * 使い方:
 * 1. このコードをGASエディタに貼り付け
 * 2. add59AMQuestions() を実行
 */

var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

function add59AMQuestions() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');

    if (!sheet) {
        Logger.log('AllQuestions シートが見つかりません');
        return;
    }

    // 第59回午前の問題データ
    // 正解番号は1ベースで入力し、スクリプト内で0ベースに変換します
    var questions = [
        {
            question_no: 1,
            category: '運動器',
            question_text: '30歳の女性。バドミントンの選手である。膝前十字靱帯損傷を予防するための指導で最も適切なのはどれか。',
            options: [
                '後方重心を意識した動作を指導する。',
                '体幹浅層の筋カトレーニングを指導する。',
                '下肢遠位筋の協調性トレーニングを指導する。',
                'ジャンプ着地時に膝が内反位にならないように指導する。',
                '静的な姿勢保持からバランストレーニングに進めるように指導する。'
            ],
            correct_idx: 5, // 1ベース
            image_url: ''
        },
        {
            question_no: 2,
            category: '内部障害',
            question_text: '84歳の男性。心疾患の既往はない。転倒して右大腿骨近位部骨折を受傷し、緊急で骨接合術を受けた。翌日離床を目的に理学療法が処方されたが、右下腿の腫脹と圧痛を訴えている。最も優先的に確認すべき血液検査項目はどれか。',
            options: [
                'BNP',
                'Dダイマー',
                'HbAlc',
                'PT-INR',
                'SP-D'
            ],
            correct_idx: 2, // 1ベース
            image_url: ''
        },
        {
            question_no: 3,
            category: '中枢神経',
            question_text: '65歳の男性。入浴中、軽度の意識障害および左片麻痺が突然出現したため救急車で搬送された。救急外来到着時の頭部単純CTを示す。考えられるのはどれか。',
            options: [
                '慢性硬膜下血腫',
                'くも膜下出血',
                '脳梗塞',
                '脳挫傷',
                '脳出血'
            ],
            correct_idx: 5, // 1ベース
            image_url: '' // 画像がある場合はGoogle DriveのURLを設定
        }
        // ここに残りの問題を追加していく...
    ];

    var addedCount = 0;

    questions.forEach(function (q) {
        var id = '59-AM-' + String(q.question_no).padStart(2, '0');

        // 既存チェック（重複回避）
        var data = sheet.getDataRange().getValues();
        var exists = data.some(function (row) { return row[0] === id; });

        if (exists) {
            Logger.log('スキップ（既存）: ' + id);
            return;
        }

        // 0ベースに変換
        var correctIdx0Based = q.correct_idx - 1;

        var row = [
            id,                           // id
            59,                           // exam_year
            '午前',                        // section
            q.question_no,                // question_no
            q.category,                   // category
            q.question_text,              // question_text
            JSON.stringify(q.options),    // options_json
            correctIdx0Based,             // correct_idx (0ベース)
            '（解説準備中）',               // explanation
            q.image_url || '',            // image_url
            3,                            // difficulty_level
            new Date(),                   // created_at
            q.image_url ? 'with_image' : 'text_only'  // display_type
        ];

        sheet.appendRow(row);
        addedCount++;
        Logger.log('追加完了: ' + id);
    });

    Logger.log('=== 完了 ===');
    Logger.log('追加した問題数: ' + addedCount);
}

/**
 * 問題をテキスト形式から配列に変換するヘルパー
 * PDFからコピペしたテキストを整形する際に使用
 */
function parseQuestionText(rawText) {
    // 必要に応じてパース処理を追加
    return rawText.trim();
}
