/**
 * データの不整合をチェックするためのデバッグ用スクリプト
 * 
 * 実行方法：
 * 1. エディタの上部にある関数選択ドロップダウンから「debugCheckData」を選択します。
 * 2. 「実行」ボタンをクリックします。
 * 3. 画面下部の「実行ログ」を確認し、内容をチャットで教えてください。
 */
var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

function debugCheckData() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);

    // 1. AllQuestions（マスターデータ）のチェック
    var qSheet = ss.getSheetByName('AllQuestions');
    if (!qSheet) {
        Logger.log('❌ ERROR: AllQuestions シートが見つかりません');
        return;
    }

    var qData = qSheet.getDataRange().getValues();
    Logger.log('--- AllQuestions (Total: ' + (qData.length - 1) + ') ---');

    // 特に確認したいID（ユーザー報告に基づく）
    var checkTargets = ['60-PM-07', '59-PM-10', '50-PM-03', '54-AM-53'];
    var foundInMaster = {};

    // 全データを走査してターゲットを探す
    for (var i = 1; i < qData.length; i++) {
        var row = qData[i];
        var id = String(row[0]);

        // ターゲットIDが含まれているかチェック
        for (var j = 0; j < checkTargets.length; j++) {
            var target = checkTargets[j];
            if (id === target) {
                foundInMaster[target] = true;
                Logger.log('✅ FOUND in Master: [' + id + ']');
                logCharCodes(id); // 文字コード詳細出力
            }
        }
    }

    // マスターになかったものを報告
    checkTargets.forEach(function (target) {
        if (!foundInMaster[target]) {
            Logger.log('⚠️ NOT FOUND in Master: [' + target + ']');
        }
    });

    // 2. StudentLogs（学習履歴）のチェック
    var lSheet = ss.getSheetByName('StudentLogs');
    if (!lSheet) {
        Logger.log('❌ ERROR: StudentLogs シートが見つかりません');
        return;
    }

    var lData = lSheet.getDataRange().getValues();
    Logger.log('\n--- StudentLogs (Last 10) ---');

    // 最新10件を表示
    var startRow = Math.max(1, lData.length - 10);
    for (var i = startRow; i < lData.length; i++) {
        var row = lData[i];
        var timestamp = row[0];
        var qId = String(row[3]);
        var cat = row[4];
        var isCorrect = row[6];

        // ターゲットに関連しそうなログだけ詳細表示、または最新ログは全部出す
        Logger.log('LOG: [' + qId + '] Correct:' + isCorrect + ' (' + timestamp + ')');

        // ターゲットIDなら文字コードもチェック
        if (checkTargets.indexOf(qId) !== -1) {
            logCharCodes(qId);
        }
    }
}

// 文字列の文字コードをログ出力（隠れ文字や全角半角の確認用）
function logCharCodes(str) {
    var codes = [];
    for (var i = 0; i < str.length; i++) {
        codes.push(str.charCodeAt(i));
    }
    Logger.log('   Codes: ' + codes.join(','));
}
