/**
 * 分野（category）を統一するスクリプト
 * 
 * 統一ルール:
 * - 中枢神経、神経筋 → 中枢
 * - 骨関節、運動器 → 運動器
 * - 内部、内部障害 → 内部
 * - 物理療法 → 物療
 * - 心理、精神 → それぞれ維持
 * 
 * 分野一覧:
 * - 解剖学: 骨・筋・神経の解剖
 * - 生理学: 生理機能
 * - 運動学: 運動学・生体力学
 * - 評価: 評価法・検査
 * - 運動器: 整形外科疾患・整形外科的テスト
 * - 中枢: 脳・脊髄疾患
 * - 内部: 循環器・呼吸器・代謝
 * - 小児: 小児疾患
 * - 義肢装具: 義肢装具学
 * - 物療: 物理療法
 * - ADL: ADL・福祉機器
 * - 精神: 精神医学
 * - 心理: 心理学
 * - 概論: 制度・法律・研究
 */

var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

function updateAllCategories() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');
    var data = sheet.getDataRange().getValues();

    // カテゴリの統一マッピング
    var categoryMapping = {
        // 中枢系統一
        '中枢神経': '中枢',
        '神経筋': '中枢',

        // 運動器系統一
        '骨関節': '運動器',

        // 内部系統一
        '内部障害': '内部',

        // 物療系統一
        '物理療法': '物療',

        // 脊髄損傷は運動器に
        '脊髄損傷': '運動器',

        // 摂食嚥下は内部に
        '摂食嚥下': '内部',

        // 研究・医療倫理・医療安全・地域は概論に
        '研究': '概論',
        '医療倫理': '概論',
        '医療安全': '概論',
        '地域': '概論',

        // ICFはADLに
        'ICF': 'ADL',

        // 老年は内部に（高齢者の身体機能）
        '老年': '内部',

        // 高次脳機能は中枢に
        '高次脳機能': '中枢',

        // 薬理は概論に
        '薬理': '概論',

        // 皮膚は運動器に
        '皮膚': '運動器'
    };

    var updatedCount = 0;
    var categoryColumn = 5; // E列（0始まり: 4 → 5列目）

    // ヘッダー行をスキップして2行目から処理
    for (var i = 1; i < data.length; i++) {
        var currentCategory = data[i][categoryColumn - 1]; // 0始まりなので-1

        if (categoryMapping[currentCategory]) {
            var newCategory = categoryMapping[currentCategory];
            sheet.getRange(i + 1, categoryColumn).setValue(newCategory);
            Logger.log('更新: ' + data[i][0] + ' | ' + currentCategory + ' → ' + newCategory);
            updatedCount++;
        }
    }

    Logger.log('===========================');
    Logger.log('更新完了！ 合計: ' + updatedCount + '件');

    // 更新後のカテゴリ別件数を表示
    showCategorySummary();
}

/**
 * 現在のカテゴリ別件数を表示
 */
function showCategorySummary() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');
    var data = sheet.getDataRange().getValues();

    var categoryCounts = {};

    // ヘッダー行をスキップ
    for (var i = 1; i < data.length; i++) {
        var category = data[i][4]; // E列（0始まり）
        if (category) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
    }

    Logger.log('===========================');
    Logger.log('📊 カテゴリ別件数:');
    Logger.log('===========================');

    var sortedCategories = Object.keys(categoryCounts).sort();
    for (var j = 0; j < sortedCategories.length; j++) {
        var cat = sortedCategories[j];
        Logger.log(cat + ': ' + categoryCounts[cat] + '件');
    }

    Logger.log('===========================');
    Logger.log('総問題数: ' + (data.length - 1) + '件');
}

/**
 * カテゴリ一覧を確認するだけ（更新なし）
 */
function checkCategories() {
    showCategorySummary();
}
