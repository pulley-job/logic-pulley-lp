/**
 * IDのフォーマットを3桁ゼロ埋めに変更するスクリプト
 * 例: 50-AM-01 -> 50-AM-001
 */
var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

function convertIdsTo3Digits() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);

    // 1. AllQuestionsシートの更新
    var qSheet = ss.getSheetByName('AllQuestions');
    if (qSheet) {
        var range = qSheet.getDataRange();
        var values = range.getValues();
        var updatedCount = 0;

        // ヘッダー行(0)はスキップ
        for (var i = 1; i < values.length; i++) {
            var currentId = String(values[i][0]);
            var parts = currentId.split('-');

            // フォーマットが XX-XX-XX の場合のみ処理
            if (parts.length === 3) {
                var year = parts[0];
                var type = parts[1];
                var num = parseInt(parts[2], 10);

                // 3桁ゼロ埋め
                var newNumStr = String(num).padStart(3, '0');
                var newId = year + '-' + type + '-' + newNumStr;

                var isChanged = false;

                // IDの更新
                if (currentId !== newId) {
                    values[i][0] = newId;
                    isChanged = true;
                }

                // question_noの更新 (index 3)
                var currentNo = values[i][3];
                if (String(currentNo) !== newNumStr) {
                    values[i][3] = "'" + newNumStr; // 文字列として保存するためにシングルクォートを付与（GAS/Sheetsの挙動対策）
                    isChanged = true;
                }

                if (isChanged) {
                    updatedCount++;
                }
            }
        }

        if (updatedCount > 0) {
            range.setValues(values);
            Logger.log('AllQuestions updated: ' + updatedCount + ' rows.');
        } else {
            Logger.log('AllQuestions: No updates needed.');
        }
    }

    // 2. StudentLogsシートの更新 (整合性維持のため)
    var lSheet = ss.getSheetByName('StudentLogs');
    if (lSheet) {
        var range = lSheet.getDataRange();
        var values = range.getValues();
        var updatedCount = 0;

        // ヘッダー行(0)はスキップ
        for (var i = 1; i < values.length; i++) {
            var currentId = String(values[i][3]); // IDはD列(index 3)
            if (currentId && currentId !== '') {
                var parts = currentId.split('-');
                if (parts.length === 3) {
                    var year = parts[0];
                    var type = parts[1];
                    var num = parseInt(parts[2], 10);

                    var newNumStr = String(num).padStart(3, '0');
                    var newId = year + '-' + type + '-' + newNumStr;

                    if (currentId !== newId) {
                        values[i][3] = newId;
                        updatedCount++;
                    }
                }
            }
        }

        if (updatedCount > 0) {
            range.setValues(values);
            Logger.log('StudentLogs updated: ' + updatedCount + ' rows.');
        } else {
            Logger.log('StudentLogs: No updates needed.');
        }
    }
}
