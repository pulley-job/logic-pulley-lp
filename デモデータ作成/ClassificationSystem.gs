/**
 * 理学療法士国家試験 分類システム
 * 
 * Gem分類ロジックに基づくDB拡張スクリプト
 * 
 * 大分類（問題番号ベース）:
 * - 1〜20: 実地
 * - 21〜50: 専門
 * - 51〜100: 基礎
 * 
 * 中分類マスター:
 * ADL, リハ概, 運動学, 運動器, 義肢, 装具, 小児, 人発, 中枢, 内部, 評価, 物療, 心理, 精神
 */

var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

/**
 * ステップ1: 大分類列を追加し、問題番号から自動判定
 */
function addMajorCategoryColumn() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // 大分類列が既にあるか確認
    var majorCatIndex = headers.indexOf('major_category');

    if (majorCatIndex === -1) {
        // 列を追加（category列の前に挿入）
        var categoryIndex = headers.indexOf('category');
        sheet.insertColumnBefore(categoryIndex + 1); // 1始まり
        sheet.getRange(1, categoryIndex + 1).setValue('major_category');
        majorCatIndex = categoryIndex;
        Logger.log('major_category列を追加しました');

        // 再取得
        data = sheet.getDataRange().getValues();
        headers = data[0];
    }

    // 問題番号から大分類を判定して設定
    var questionNoIndex = headers.indexOf('question_no');
    majorCatIndex = headers.indexOf('major_category');

    var updatedCount = 0;

    for (var i = 1; i < data.length; i++) {
        var questionNo = parseInt(data[i][questionNoIndex]);
        var majorCategory = getMajorCategory(questionNo);

        sheet.getRange(i + 1, majorCatIndex + 1).setValue(majorCategory);
        updatedCount++;
    }

    Logger.log('大分類を ' + updatedCount + ' 件更新しました');
}

/**
 * 問題番号から大分類を判定
 */
function getMajorCategory(questionNo) {
    if (questionNo >= 1 && questionNo <= 20) {
        return '実地';
    } else if (questionNo >= 21 && questionNo <= 50) {
        return '専門';
    } else if (questionNo >= 51 && questionNo <= 100) {
        return '基礎';
    } else {
        return '不明';
    }
}

/**
 * ステップ2: 中分類（category）を正規化
 * 現在のcategoryを分類マスター辞書に基づき統一
 */
function normalizeMidCategory() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var categoryIndex = headers.indexOf('category');

    // 中分類マッピング（現在のcategory → 正規化後）
    var midCategoryMapping = {
        // 中枢系
        '中枢神経': '中枢',
        '神経筋': '中枢',
        '高次脳機能': '中枢',

        // 運動器系
        '骨関節': '運動器',
        '脊髄損傷': '運動器',
        '皮膚': '運動器',

        // 内部系
        '内部障害': '内部',
        '摂食嚥下': '内部',
        '老年': '内部',

        // 物療
        '物理療法': '物療',

        // 概論系 → リハ概
        '概論': 'リハ概',
        '研究': 'リハ概',
        '医療倫理': 'リハ概',
        '医療安全': 'リハ概',
        '地域': 'リハ概',
        '薬理': 'リハ概',

        // ADL系
        'ICF': 'ADL',

        // 解剖学・生理学 → より適切な分類に
        '解剖学': '運動学', // 基礎的な骨・筋・関節
        '生理学': '内部'    // 生理機能
    };

    var updatedCount = 0;

    for (var i = 1; i < data.length; i++) {
        var currentCategory = data[i][categoryIndex];

        if (midCategoryMapping[currentCategory]) {
            var newCategory = midCategoryMapping[currentCategory];
            sheet.getRange(i + 1, categoryIndex + 1).setValue(newCategory);
            Logger.log('更新: ' + data[i][0] + ' | ' + currentCategory + ' → ' + newCategory);
            updatedCount++;
        }
    }

    Logger.log('中分類を ' + updatedCount + ' 件更新しました');
}

/**
 * ステップ3: 小分類列を追加（オプション）
 * キーワードや問題文から小分類を推定
 */
function addMinorCategoryColumn() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // 小分類列が既にあるか確認
    var minorCatIndex = headers.indexOf('minor_category');

    if (minorCatIndex === -1) {
        var categoryIndex = headers.indexOf('category');
        sheet.insertColumnAfter(categoryIndex + 1);
        sheet.getRange(1, categoryIndex + 2).setValue('minor_category');
        Logger.log('minor_category列を追加しました');
    }

    // 小分類マスター辞書
    var minorCategoryDict = {
        'ADL': ['ADL', '車いす補装具', '指導'],
        'リハ概': ['保健医療福祉', 'リハビリテーション概論', '臨床実習'],
        '運動学': ['骨', '関節', '靱帯', '筋', '上肢の運動学', '下肢の運動学', '姿勢', '歩行', 'バイオメカニクス', '運動学習', '運動療法', 'ROM', '筋力強化', 'ファシリテーション', '臨床運動学', '力学', '神経'],
        '運動器': ['慢性疼痛', '整形外科', 'RA', '関節', '骨折・脱臼', '靱帯・筋', '末梢神経', '上肢', '下肢', '体幹', 'スポーツ', '熱傷', '脊髄損傷'],
        '義肢': ['義肢', '義足', '歩行', 'PT'],
        '装具': ['装具', '上肢装具', '下肢装具', '靴型装具', '体幹'],
        '小児': ['発達・小児', 'CP', '筋ジストロフィー', '二分脊椎'],
        '人発': ['人間発達'],
        '中枢': ['顔面', '神経', '感覚と受容器', '脳血管疾患', '症状・評価', '理学療法専門', '補装具', 'リスク', '頭部外傷', '神経・筋', 'パーキンソン', '失調', 'ALS', 'ギランバレー', '多発性硬化症', '多発性筋炎'],
        '内部': ['循環系', '呼吸系', '消化吸収', '泌尿器・生殖器', '代謝', 'ホルモン', '癌の障害', '総論', '老年期障害', '呼吸', '循環', '高齢期障害', 'がん'],
        '評価': ['評価法', '計測', 'ROM', 'MMT・筋', '反射・感覚'],
        '物療': ['物理療法', '電気', 'マイクロ', '光線', '温冷', '超音波', '水治療法', '牽引', 'バイオフィードバック'],
        '心理': ['防衛機制', '転移', '学習・記憶', '発達心理および臨床心理', '臨床心理検査法', '心理療法およびカウンセリング'],
        '精神': ['総論', '器質性精神障害', '精神作用物質', '統合失調症', '気分障害', '神経症性障害', 'パーソナリティ障害', '精神遅滞', '心理的発達の障害', 'てんかん']
    };

    Logger.log('小分類辞書を設定しました（手動または問題文解析で設定可能）');
}

/**
 * 全ステップを一括実行
 */
function runAllClassificationSteps() {
    Logger.log('=== 分類システム更新開始 ===');

    // ステップ1: 大分類追加
    Logger.log('\n--- ステップ1: 大分類列追加 ---');
    addMajorCategoryColumn();

    // ステップ2: 中分類正規化
    Logger.log('\n--- ステップ2: 中分類正規化 ---');
    normalizeMidCategory();

    // ステップ3: 小分類列追加（構造のみ）
    Logger.log('\n--- ステップ3: 小分類列追加 ---');
    addMinorCategoryColumn();

    Logger.log('\n=== 分類システム更新完了 ===');
    showClassificationSummary();
}

/**
 * 分類サマリーを表示
 */
function showClassificationSummary() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var majorCatIndex = headers.indexOf('major_category');
    var categoryIndex = headers.indexOf('category');

    var majorCounts = {};
    var midCounts = {};

    for (var i = 1; i < data.length; i++) {
        var major = data[i][majorCatIndex] || '未設定';
        var mid = data[i][categoryIndex] || '未設定';

        majorCounts[major] = (majorCounts[major] || 0) + 1;
        midCounts[mid] = (midCounts[mid] || 0) + 1;
    }

    Logger.log('\n📊 大分類別件数:');
    Object.keys(majorCounts).sort().forEach(function (key) {
        Logger.log('  ' + key + ': ' + majorCounts[key] + '件');
    });

    Logger.log('\n📊 中分類別件数:');
    Object.keys(midCounts).sort().forEach(function (key) {
        Logger.log('  ' + key + ': ' + midCounts[key] + '件');
    });

    Logger.log('\n総問題数: ' + (data.length - 1) + '件');
}
