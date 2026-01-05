// --- CONFIGURATION ---
var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0'; // 国家試験問題マスターDB
var SOURCE_SS_ID = '1ujmh9rTuahU2-hHeJ2q-UxZoKGaEGhlQez2_XBBWbF4'; // 過去問原本
// ---------------------

function createExamMasterData() {
    // 1. Create Spreadsheet
    var fileName = '国家試験問題マスターDB_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
    var ss = SpreadsheetApp.create(fileName);

    // --- Move to Target Folder ---
    var folderId = '1BjBIyH1Nl9wezl0R7AKESjdr2eq1vaxw';
    try {
        var file = DriveApp.getFileById(ss.getId());
        var folder = DriveApp.getFolderById(folderId);
        file.moveTo(folder);
        console.log('Success: Moved file to folder "' + folder.getName() + '"');
    } catch (e) {
        console.warn('Warning: Could not move folder. Created in Root. Error: ' + e.toString());
    }
    // -----------------------------

    var sheet = ss.getActiveSheet();
    sheet.setName('AllQuestions');

    // 2. Define Headers
    var headers = [
        'id', 'exam_year', 'section', 'question_no', 'category',
        'question_text', 'options_json', 'correct_idx', 'explanation',
        'image_url', 'difficulty_level', 'created_at', 'display_type'
    ];
    sheet.appendRow(headers);

    // 3. Create Sample Data
    // Note: correct_idx can be single "2" or multiple "2,3" (comma separated string)
    var sampleData = [
        ['58-AM-01', 58, '午前', 1, '解剖学', '上腕二頭筋の主な作用はどれか。', JSON.stringify(['肩関節の伸展', '肘関節の伸展', '前腕の回外', '肩関節の内転', '手関節の掌屈']), '2', '（解説準備中）', '', 2, new Date(), 'text_only'],
        ['58-AM-02', 58, '午前', 2, '生理学', '神経活動電位の脱分極を引き起こすイオンはどれか。', JSON.stringify(['カリウムイオン (K+)', 'ナトリウムイオン (Na+)', 'カルシウムイオン (Ca2+)', '塩化物イオン (Cl-)', 'マグネシウムイオン (Mg2+)']), '1', '（解説準備中）', '', 3, new Date(), 'text_only']
    ];
    sampleData.forEach(function (row) { sheet.appendRow(row); });

    // 4. Formatting
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E6F4EA');

    console.log('SPREADSHEET_CREATED_URL: ' + ss.getUrl());
    console.log('Please update the TARGET_SS_ID at the top of the script with: ' + ss.getId());
}

/**
 * Web API Endpoint - Supports Google OAuth and Student ID authentication
 * 
 * Usage:
 *   GET ?token=xxx&action=list          -> Returns all questions (Google auth)
 *   GET ?student_id=xxx&action=list     -> Returns all questions (Student ID auth)
 *   GET ?token=xxx&action=generate&id=58-AM-01  -> Generates explanation
 *   GET ?action=google_verify&token=xxx -> Verifies Google token (for login)
 *   GET ?action=student_verify&student_id=xxx -> Verifies student ID (for login)
 * 
 * Requires GOOGLE_CLIENT_ID to be set in Script Properties
 */
function doGet(e) {
    var action = e && e.parameter && e.parameter.action ? e.parameter.action : 'list';
    var providedToken = e && e.parameter && e.parameter.token ? e.parameter.token : '';
    var studentId = e && e.parameter && e.parameter.student_id ? e.parameter.student_id : '';

    // Special action: verify Google token (for login screen)
    if (action === 'google_verify') {
        return handleGoogleVerify(providedToken);
    }

    // Special action: verify student ID (for login screen)
    if (action === 'student_verify') {
        return handleStudentVerify(studentId);
    }

    // For all other actions, require valid authentication (Google OR Student ID)
    var isAuthenticated = false;
    var userInfo = null;

    if (providedToken) {
        userInfo = verifyGoogleToken(providedToken);
        if (userInfo) {
            isAuthenticated = true;
        }
    } else if (studentId) {
        if (verifyStudentId(studentId)) {
            isAuthenticated = true;
            userInfo = { studentId: studentId, authType: 'student_id' };
        }
    }

    if (!isAuthenticated) {
        return ContentService.createTextOutput(JSON.stringify({
            error: 'Unauthorized. Please sign in.'
        })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Authenticated Request Processing ---
    if (!TARGET_SS_ID) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'Spreadsheet ID not set in script.' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'generate') {
        return handleGenerateExplanation(e);
    } else if (action === 'log_answer') {
        // Log student answer to StudentLogs sheet
        var result = logAnswer(e.parameter);
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'get_stats') {
        // Get user statistics for dashboard
        var userId = userInfo.email || userInfo.studentId;
        var stats = getUserStats(userId);
        return ContentService.createTextOutput(JSON.stringify(stats)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'send_report') {
        // Send learning report via email
        var result = sendLearningReport(e.parameter);
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else {
        return handleListQuestions();
    }
}

/**
 * Handle Google token verification for login
 */
function handleGoogleVerify(token) {
    var userInfo = verifyGoogleToken(token);
    if (userInfo) {
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            email: userInfo.email,
            name: userInfo.name
        })).setMimeType(ContentService.MimeType.JSON);
    } else {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Invalid Google token'
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Verify Google ID Token
 * Returns user info if valid, null if invalid
 */
function verifyGoogleToken(idToken) {
    if (!idToken) return null;

    var clientId = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_ID');
    if (!clientId) {
        console.error('GOOGLE_CLIENT_ID not set in Script Properties');
        return null;
    }

    try {
        // Verify the token with Google's API
        var url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
        var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        var data = JSON.parse(response.getContentText());

        // Check if token is valid and matches our client ID
        if (data.error) {
            console.log('Token verification error:', data.error);
            return null;
        }

        if (data.aud !== clientId) {
            console.log('Token audience mismatch');
            return null;
        }

        // Token is valid, return user info
        return {
            email: data.email,
            name: data.name,
            picture: data.picture,
            sub: data.sub // Google user ID
        };
    } catch (e) {
        console.error('Token verification exception:', e);
        return null;
    }
}

/**
 * Handle student ID verification for login
 */
function handleStudentVerify(studentId) {
    if (verifyStudentId(studentId)) {
        return ContentService.createTextOutput(JSON.stringify({
            success: true
        })).setMimeType(ContentService.MimeType.JSON);
    } else {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: '学生IDは3文字以上で入力してください'
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Verify Student ID
 * Simple validation: must be at least 3 characters
 * You can add more complex validation here (e.g., check against a roster)
 */
function verifyStudentId(studentId) {
    if (!studentId || typeof studentId !== 'string') {
        return false;
    }

    // Basic validation: at least 3 characters
    if (studentId.trim().length < 3) {
        return false;
    }

    // Optional: Add more validation here
    // - Check against a list of registered students
    // - Validate format (e.g., must start with certain pattern)

    return true;
}

/**
 * List all questions (default action)
 */
function handleListQuestions() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions') || ss.getSheets()[0];

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);

    var questions = rows.map(function (row) {
        var question = {};
        headers.forEach(function (header, index) {
            if (header === 'options_json') {
                try { question['options'] = JSON.parse(row[index]); } catch (e) { question['options'] = []; }
            } else if (header === 'correct_idx') {
                // Return as array of numbers [0, 2] for easier frontend handling
                var val = String(row[index]);
                question['correct_indexes'] = val.split(',').map(function (v) { return parseInt(v); }).filter(function (n) { return !isNaN(n); });
                question['correct_idx'] = question['correct_indexes'][0]; // Backward compatibility
            } else {
                question[header] = row[index];
            }
        });
        return question;
    });

    return ContentService.createTextOutput(JSON.stringify(questions)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Generate explanation for a specific question on-demand
 */
function handleGenerateExplanation(e) {
    var questionId = e && e.parameter && e.parameter.id ? e.parameter.id : null;

    if (!questionId) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'Missing question ID parameter.' })).setMimeType(ContentService.MimeType.JSON);
    }

    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'API key not configured.' })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions') || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // Find column indexes
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h] = i; });

    // Find the row with the matching ID
    var targetRowIndex = -1;
    for (var i = 1; i < data.length; i++) {
        if (data[i][colMap['id']] === questionId) {
            targetRowIndex = i;
            break;
        }
    }

    if (targetRowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'Question not found: ' + questionId })).setMimeType(ContentService.MimeType.JSON);
    }

    var row = data[targetRowIndex];
    var currentExplanation = row[colMap['explanation']];

    // If already has a real explanation, return it
    if (currentExplanation && currentExplanation !== '（解説準備中）' && currentExplanation !== '') {
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            explanation: currentExplanation,
            cached: true
        })).setMimeType(ContentService.MimeType.JSON);
    }

    // Extract question data
    var q = row[colMap['question_text']];
    var opts = [];
    try { opts = JSON.parse(row[colMap['options_json']]); } catch (e) { }
    var cat = row[colMap['category']];

    // Handle multiple correct answers
    var correctRaw = String(row[colMap['correct_idx']]);
    var correctIndexes = correctRaw.split(',').map(Number);
    var correctAnswerText = correctIndexes.map(function (idx) {
        return opts[idx] || '不明な選択肢';
    }).join(' と ');

    // Call Gemini API
    var explanation = callGeminiAPI(apiKey, cat, q, opts, correctAnswerText);

    if (explanation) {
        // Save to spreadsheet
        sheet.getRange(targetRowIndex + 1, colMap['explanation'] + 1).setValue(explanation);

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            explanation: explanation,
            cached: false
        })).setMimeType(ContentService.MimeType.JSON);
    } else {
        return ContentService.createTextOutput(JSON.stringify({
            error: 'Failed to generate explanation. Please try again.'
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Legacy Data Importer
 */
function importFromLegacySheet() {
    if (!TARGET_SS_ID) { console.error('Target SS ID missing.'); return; }

    var sourceSs = SpreadsheetApp.openById(SOURCE_SS_ID);
    var sourceSheet = sourceSs.getSheetByName('過去問原本');
    if (!sourceSheet) { console.error('Sheet "過去問原本" not found.'); return; }

    var targetSs = SpreadsheetApp.openById(TARGET_SS_ID);
    var targetSheet = targetSs.getSheetByName('AllQuestions') || targetSs.getSheets()[0];

    var sourceRows = sourceSheet.getDataRange().getValues().slice(1);
    var newRows = [];

    sourceRows.forEach(function (row) {
        var examYear = String(row[0]).replace(/[^0-9]/g, '') || 0;
        var section = (String(row[1]).indexOf('PM') !== -1 || String(row[1]).indexOf('午後') !== -1) ? '午後' : '午前';
        var qNo = String(row[6]).replace(/[^0-9]/g, '') || 0;
        var id = examYear + '-' + (section === '午前' ? 'AM' : 'PM') + '-' + ('00' + qNo).slice(-2);

        var options = [row[8], row[9], row[10], row[11], row[12]].map(function (o) { return String(o).trim(); });

        // --- 複数正解への対応 ---
        // 元データ (row[14]) が "1" や "1,3" や "3, 5" となっている想定
        // これを 0-based index のカンマ区切り文字列 "0" や "0,2" に変換する
        var correctIndices = [];
        if (row[14]) {
            // 全ての数字を抽出
            var nums = String(row[14]).match(/\d+/g);
            if (nums) {
                correctIndices = nums.map(function (n) {
                    return parseInt(n) - 1; // 1-based to 0-based
                });
            }
        }
        // なければとりあえず 0
        if (correctIndices.length === 0) correctIndices = [0];

        // スプレッドシートには "0,2" のような文字列として保存
        var correctIdxStr = correctIndices.join(',');

        newRows.push([
            id, Number(examYear), section, Number(qNo), row[3] || '未分類', row[7],
            JSON.stringify(options),
            correctIdxStr, // Modified to store string
            '（解説準備中）', row[13], 3, new Date(),
            row[13] ? 'with_image' : 'text_only'
        ]);
    });

    var chunkSize = 500;
    for (var i = 0; i < newRows.length; i += chunkSize) {
        var chunk = newRows.slice(i, i + chunkSize);
        targetSheet.getRange(targetSheet.getLastRow() + 1, 1, chunk.length, chunk[0].length).setValues(chunk);
    }
    console.log('Imported ' + newRows.length + ' questions with multi-answer support.');
}

/**
 * AI Explanation Generator (Batch)
 */
function generateExplanationsWithGemini() {
    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) return;

    if (!TARGET_SS_ID) return;
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions') || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var colMap = {};
    headers.forEach(function (h, i) { colMap[h] = i; });
    var explanationIdx = colMap['explanation'];

    var limit = 20;
    var count = 0;

    for (var i = 1; i < data.length; i++) {
        if (count >= limit) break;
        var currentExpl = data[i][explanationIdx];

        if (currentExpl === '（解説準備中）' || currentExpl === '') {
            var row = data[i];
            var q = row[colMap['question_text']];
            var opts = [];
            try { opts = JSON.parse(row[colMap['options_json']]); } catch (e) { }
            var cat = row[colMap['category']];

            // --- 複数正解対応 ---
            var correctRaw = String(row[colMap['correct_idx']]);
            var correctIndexes = correctRaw.split(',').map(Number);

            // 複数の正解文言を結合 (例: "上腕二頭筋 と 上腕筋")
            var correctAnswerText = correctIndexes.map(function (idx) {
                return opts[idx] || '不明な選択肢';
            }).join(' と ');

            var explanation = callGeminiAPI(apiKey, cat, q, opts, correctAnswerText);
            if (explanation) {
                sheet.getRange(i + 1, explanationIdx + 1).setValue(explanation);
                count++;
                Utilities.sleep(1000); // 7s -> 1s (Paid API)
            }
        }
    }

    if (count > 0) SpreadsheetApp.getUi().alert(count + ' 件の解説を生成しました。');
}

function callGeminiAPI(apiKey, category, question, options, correctAnswer) {
    // gemini-2.0-flash-exp (Paid)
    var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey;

    var prompt = `あなたは理学療法士・作業療法士国家試験の専門家です。
以下の問題に対する、学生にとって分かりやすい「解説」を作成してください。

【分野】${category}
【問題】${question}
【選択肢】${options.join(', ')}
【正解】${correctAnswer}

＜出力ルール＞
・プレーンテキストのみで出力すること（**や##などのマークダウン記号は絶対に使わない）
・適切な位置で改行を入れて、読みやすくすること
・以下の構成で書くこと：

1行目：正解の理由を1〜2文で簡潔に説明
（空行）
2段落目：補足説明や関連知識があれば追記
（空行）
3段落目：誤りの選択肢について簡単に触れる（任意）

・文体は「〜である。」「〜となる。」といった教科書的な常体を使う
・全体で150〜250文字程度にまとめる
・箇条書きは使わず、文章で説明する`;

    var payload = { "contents": [{ "parts": [{ "text": prompt }] }] };

    try {
        var response = UrlFetchApp.fetch(apiUrl, {
            'method': 'post',
            'contentType': 'application/json',
            'payload': JSON.stringify(payload),
            'muteHttpExceptions': true
        });
        var json = JSON.parse(response.getContentText());
        if (json.candidates && json.candidates.length > 0) {
            return json.candidates[0].content.parts[0].text;
        } else { return null; }
    } catch (e) { return null; }
}
/**
 * Student Learning Logs Functions
 * 
 * This file contains functions for tracking student learning activity:
 * - Creating StudentLogs sheet
 * - Logging answers
 * - Retrieving statistics for dashboard
 */

// Use the same TARGET_SS_ID as ExamDataCode.js
var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

/**
 * Create StudentLogs sheet if it doesn't exist
 */
function createStudentLogsSheet() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('StudentLogs');

    if (!sheet) {
        sheet = ss.insertSheet('StudentLogs');

        // Headers
        var headers = [
            'timestamp',
            'user_id',
            'user_type',  // 'google' or 'student_id'
            'question_id',
            'category',
            'exam_year',
            'is_correct',
            'selected_answer',
            'correct_answer'
        ];

        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, headers.length)
            .setFontWeight('bold')
            .setBackground('#E6F4EA');

        Logger.log('StudentLogs sheet created successfully');
    } else {
        Logger.log('StudentLogs sheet already exists');
    }

    return sheet;
}

/**
 * Log a student's answer
 * Called from doGet with action=log_answer
 */
function logAnswer(params) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        // Create sheet if it doesn't exist
        if (!sheet) {
            sheet = createStudentLogsSheet();
        }

        var row = [
            new Date(),                          // timestamp
            params.user_id || 'unknown',         // user_id
            params.user_type || 'unknown',       // user_type
            params.question_id || '',            // question_id
            params.category || '',               // category
            params.exam_year || '',              // exam_year
            params.is_correct === 'true',        // is_correct (boolean)
            params.selected_answer || '',        // selected_answer
            params.correct_answer || ''          // correct_answer
        ];

        sheet.appendRow(row);

        return {
            success: true,
            message: 'Answer logged successfully'
        };
    } catch (e) {
        Logger.log('Error logging answer: ' + e.toString());
        return {
            success: false,
            error: e.toString()
        };
    }
}

/**
 * Get statistics for a specific user
 * Called from doGet with action=get_stats
 */
function getUserStats(userId) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        if (!sheet) {
            return {
                totalAnswers: 0,
                correctAnswers: 0,
                accuracy: 0,
                categoryStats: {},
                recentWrongQuestions: []
            };
        }

        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var rows = data.slice(1);

        // Filter by user_id
        var userRows = rows.filter(function (row) {
            return row[1] === userId; // user_id column
        });

        if (userRows.length === 0) {
            return {
                totalAnswers: 0,
                correctAnswers: 0,
                accuracy: 0,
                categoryStats: {},
                recentWrongQuestions: []
            };
        }

        // Calculate overall stats
        var totalAnswers = userRows.length;
        var correctAnswers = userRows.filter(function (row) {
            return row[6] === true; // is_correct column
        }).length;
        var accuracy = Math.round((correctAnswers / totalAnswers) * 100);

        // Calculate category stats
        var categoryStats = {};
        userRows.forEach(function (row) {
            var category = row[4]; // category column
            var isCorrect = row[6]; // is_correct column

            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, correct: 0 };
            }

            categoryStats[category].total++;
            if (isCorrect) {
                categoryStats[category].correct++;
            }
        });

        // Calculate accuracy for each category
        Object.keys(categoryStats).forEach(function (category) {
            var stats = categoryStats[category];
            stats.accuracy = Math.round((stats.correct / stats.total) * 100);
        });

        // Get recent wrong questions (last 20)
        var wrongRows = userRows.filter(function (row) {
            return row[6] === false; // is_correct = false
        }).slice(-20).reverse();

        var recentWrongQuestions = wrongRows.map(function (row) {
            return {
                question_id: row[3],
                category: row[4],
                timestamp: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')
            };
        });

        return {
            totalAnswers: totalAnswers,
            correctAnswers: correctAnswers,
            accuracy: accuracy,
            categoryStats: categoryStats,
            recentWrongQuestions: recentWrongQuestions
        };
    } catch (e) {
        Logger.log('Error getting user stats: ' + e.toString());
        return {
            error: e.toString()
        };
    }
}
var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

/**
 * Create StudentLogs sheet if it doesn't exist
 */
function createStudentLogsSheet() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('StudentLogs');

    if (!sheet) {
        sheet = ss.insertSheet('StudentLogs');

        // Headers
        var headers = [
            'timestamp',
            'user_id',
            'user_type',  // 'google' or 'student_id'
            'question_id',
            'category',
            'exam_year',
            'is_correct',
            'selected_answer',
            'correct_answer'
        ];

        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, headers.length)
            .setFontWeight('bold')
            .setBackground('#E6F4EA');

        Logger.log('StudentLogs sheet created successfully');
    } else {
        Logger.log('StudentLogs sheet already exists');
    }

    return sheet;
}

/**
 * Log a student's answer
 * Called from doGet with action=log_answer
 */
function logAnswer(params) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        // Create sheet if it doesn't exist
        if (!sheet) {
            sheet = createStudentLogsSheet();
        }

        var row = [
            new Date(),                          // timestamp
            params.user_id || 'unknown',         // user_id
            params.user_type || 'unknown',       // user_type
            params.question_id || '',            // question_id
            params.category || '',               // category
            params.exam_year || '',              // exam_year
            params.is_correct === 'true',        // is_correct (boolean)
            params.selected_answer || '',        // selected_answer
            params.correct_answer || ''          // correct_answer
        ];

        sheet.appendRow(row);

        return {
            success: true,
            message: 'Answer logged successfully'
        };
    } catch (e) {
        Logger.log('Error logging answer: ' + e.toString());
        return {
            success: false,
            error: e.toString()
        };
    }
}

/**
 * Get statistics for a specific user
 * Called from doGet with action=get_stats
 */
function getUserStats(userId) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        if (!sheet) {
            return {
                totalAnswers: 0,
                correctAnswers: 0,
                accuracy: 0,
                categoryStats: {},
                recentWrongQuestions: []
            };
        }

        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var rows = data.slice(1);

        // Filter by user_id
        var userRows = rows.filter(function (row) {
            return row[1] === userId; // user_id column
        });

        if (userRows.length === 0) {
            return {
                totalAnswers: 0,
                correctAnswers: 0,
                accuracy: 0,
                categoryStats: {},
                recentWrongQuestions: []
            };
        }

        // Calculate overall stats
        var totalAnswers = userRows.length;
        var correctAnswers = userRows.filter(function (row) {
            return row[6] === true; // is_correct column
        }).length;
        var accuracy = Math.round((correctAnswers / totalAnswers) * 100);

        // Calculate category stats
        var categoryStats = {};
        userRows.forEach(function (row) {
            var category = row[4]; // category column
            var isCorrect = row[6]; // is_correct column

            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, correct: 0 };
            }

            categoryStats[category].total++;
            if (isCorrect) {
                categoryStats[category].correct++;
            }
        });

        // Calculate accuracy for each category
        Object.keys(categoryStats).forEach(function (category) {
            var stats = categoryStats[category];
            stats.accuracy = Math.round((stats.correct / stats.total) * 100);
        });

        // Get recent wrong questions (last 20)
        var wrongRows = userRows.filter(function (row) {
            return row[6] === false; // is_correct = false
        }).slice(-20).reverse();

        var recentWrongQuestions = wrongRows.map(function (row) {
            return {
                question_id: row[3],
                category: row[4],
                timestamp: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
                selected_answer: row[7], // selected_answer column
                correct_answer: row[8]   // correct_answer column
            };
        });

        return {
            totalAnswers: totalAnswers,
            correctAnswers: correctAnswers,
            accuracy: accuracy,
            categoryStats: categoryStats,
            recentWrongQuestions: recentWrongQuestions
        };
    } catch (e) {
        Logger.log('Error getting user stats: ' + e.toString());
        return {
            error: e.toString()
        };
    }
}
var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

/**
 * Create StudentLogs sheet if it doesn't exist
 */
function createStudentLogsSheet() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('StudentLogs');

    if (!sheet) {
        sheet = ss.insertSheet('StudentLogs');

        // Headers
        var headers = [
            'timestamp',
            'user_id',
            'user_type',  // 'google' or 'student_id'
            'question_id',
            'category',
            'exam_year',
            'is_correct',
            'selected_answer',
            'correct_answer'
        ];

        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, headers.length)
            .setFontWeight('bold')
            .setBackground('#E6F4EA');

        Logger.log('StudentLogs sheet created successfully');
    } else {
        Logger.log('StudentLogs sheet already exists');
    }

    return sheet;
}

/**
 * Log a student's answer
 * Called from doGet with action=log_answer
 */
function logAnswer(params) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        // Create sheet if it doesn't exist
        if (!sheet) {
            sheet = createStudentLogsSheet();
        }

        var row = [
            new Date(),                          // timestamp
            params.user_id || 'unknown',         // user_id
            params.user_type || 'unknown',       // user_type
            params.question_id || '',            // question_id
            params.category || '',               // category
            params.exam_year || '',              // exam_year
            params.is_correct === 'true',        // is_correct (boolean)
            params.selected_answer || '',        // selected_answer
            params.correct_answer || ''          // correct_answer
        ];

        sheet.appendRow(row);

        return {
            success: true,
            message: 'Answer logged successfully'
        };
    } catch (e) {
        Logger.log('Error logging answer: ' + e.toString());
        return {
            success: false,
            error: e.toString()
        };
    }
}

/**
 * Get statistics for a specific user
 * Called from doGet with action=get_stats
 */
function getUserStats(userId) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        if (!sheet) {
            return {
                totalAnswers: 0,
                correctAnswers: 0,
                accuracy: 0,
                categoryStats: {},
                recentWrongQuestions: []
            };
        }

        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var rows = data.slice(1);

        // Filter by user_id
        var userRows = rows.filter(function (row) {
            return row[1] === userId; // user_id column
        });

        if (userRows.length === 0) {
            return {
                totalAnswers: 0,
                correctAnswers: 0,
                accuracy: 0,
                categoryStats: {},
                recentWrongQuestions: []
            };
        }

        // Calculate overall stats
        var totalAnswers = userRows.length;
        var correctAnswers = userRows.filter(function (row) {
            return row[6] === true; // is_correct column
        }).length;
        var accuracy = Math.round((correctAnswers / totalAnswers) * 100);

        // Calculate category stats
        var categoryStats = {};
        userRows.forEach(function (row) {
            var category = row[4]; // category column
            var isCorrect = row[6]; // is_correct column

            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, correct: 0 };
            }

            categoryStats[category].total++;
            if (isCorrect) {
                categoryStats[category].correct++;
            }
        });

        // Calculate accuracy for each category
        Object.keys(categoryStats).forEach(function (category) {
            var stats = categoryStats[category];
            stats.accuracy = Math.round((stats.correct / stats.total) * 100);
        });

        // Get recent wrong questions (last 20)
        var wrongRows = userRows.filter(function (row) {
            return row[6] === false; // is_correct = false
        }).slice(-20).reverse();

        var recentWrongQuestions = wrongRows.map(function (row) {
            return {
                question_id: row[3],
                category: row[4],
                timestamp: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
                selected_answer: row[7], // selected_answer column
                correct_answer: row[8]   // correct_answer column
            };
        });

        return {
            totalAnswers: totalAnswers,
            correctAnswers: correctAnswers,
            accuracy: accuracy,
            categoryStats: categoryStats,
            recentWrongQuestions: recentWrongQuestions
        };
    } catch (e) {
        Logger.log('Error getting user stats: ' + e.toString());
        return {
            error: e.toString()
        };
    }
}
var TARGET_SS_ID = '1au2KMPRzGfl92CaHigbM0UY39LBjEnwp1F2WddUcls0';

/**
 * Create StudentLogs sheet if it doesn't exist
 */
function createStudentLogsSheet() {
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('StudentLogs');

    if (!sheet) {
        sheet = ss.insertSheet('StudentLogs');

        // Headers
        var headers = [
            'timestamp',
            'user_id',
            'user_type',  // 'google' or 'student_id'
            'question_id',
            'category',
            'exam_year',
            'is_correct',
            'selected_answer',
            'correct_answer'
        ];

        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, headers.length)
            .setFontWeight('bold')
            .setBackground('#E6F4EA');

        Logger.log('StudentLogs sheet created successfully');
    } else {
        Logger.log('StudentLogs sheet already exists');
    }

    return sheet;
}

/**
 * Log a student's answer
 * Called from doGet with action=log_answer
 */
function logAnswer(params) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        // Create sheet if it doesn't exist
        if (!sheet) {
            sheet = createStudentLogsSheet();
        }

        var row = [
            new Date(),                          // 0: timestamp
            params.user_id || 'unknown',         // 1: user_id
            params.user_type || 'unknown',       // 2: user_type
            params.question_id || '',            // 3: question_id
            params.category || '',               // 4: category
            params.exam_year || '',              // 5: exam_year
            params.is_correct === 'true',        // 6: is_correct
            params.selected_answer || '',        // 7: selected_answer
            params.correct_answer || '',         // 8: correct_answer
            params.confidence || 'unknown',      // 9: confidence
            params.question_no || ''             // 10: question_no
        ];

        sheet.appendRow(row);

        return {
            success: true,
            message: 'Answer logged successfully'
        };
    } catch (e) {
        Logger.log('Error logging answer: ' + e.toString());
        return {
            success: false,
            error: e.toString()
        };
    }
}

/**
 * Get statistics for a specific user
 * Called from doGet with action=get_stats
 */
function getUserStats(userId) {
    try {
        var ss = SpreadsheetApp.openById(TARGET_SS_ID);
        var sheet = ss.getSheetByName('StudentLogs');

        if (!sheet) {
            return { totalAnswers: 0, correctAnswers: 0, accuracy: 0, categoryStats: {}, recentWrongQuestions: [] };
        }

        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var rows = data.slice(1);

        // Filter by user_id
        var userRows = rows.filter(function (row) {
            return String(row[1]) === String(userId);
        });

        if (userRows.length === 0) {
            return { totalAnswers: 0, correctAnswers: 0, accuracy: 0, categoryStats: {}, recentWrongQuestions: [] };
        }

        var totalAnswers = userRows.length;
        var correctAnswers = userRows.filter(function (row) { return row[6] === true; }).length;
        var accuracy = Math.round((correctAnswers / totalAnswers) * 100);

        var categoryStats = {};
        userRows.forEach(function (row) {
            var category = row[4];
            var isCorrect = row[6];
            if (!categoryStats[category]) categoryStats[category] = { total: 0, correct: 0 };
            categoryStats[category].total++;
            if (isCorrect) categoryStats[category].correct++;
        });

        Object.keys(categoryStats).forEach(function (cat) {
            categoryStats[cat].accuracy = Math.round((categoryStats[cat].correct / categoryStats[cat].total) * 100);
        });

        // 復習リスト（不正解、または正解×自信なし）
        var reviewRows = userRows.filter(function (row) {
            var isCorrect = row[6];
            var confidence = row[9];
            return (isCorrect === false) || (isCorrect === true && confidence === 'low');
        }).slice(-30).reverse();

        var recentWrongQuestions = reviewRows.map(function (row) {
            var qId = row[3];
            var examYear = row[5];
            var questionNo = row[10];

            // 過去の古いログで年/番号が空の場合、IDからパースを試みる (e.g. "60-AM-01")
            if (!examYear || !questionNo) {
                var parts = String(qId).split('-');
                if (parts.length >= 3) {
                    if (!examYear) examYear = parts[0];
                    if (!questionNo) questionNo = parseInt(parts[2]);
                }
            }

            return {
                question_id: qId,
                category: row[4],
                exam_year: examYear,
                is_correct: row[6],
                selected_answer: row[7],
                correct_answer: row[8],
                confidence: row[9],
                question_no: questionNo,
                timestamp: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')
            };
        });

        return {
            totalAnswers: totalAnswers,
            correctAnswers: correctAnswers,
            accuracy: accuracy,
            categoryStats: categoryStats,
            recentWrongQuestions: recentWrongQuestions
        };
    } catch (e) {
        Logger.log('Error: ' + e.toString());
        return { error: e.toString() };
    }
}

/**
 * 学習レポートをメールで送信する（PDF添付あり）
 */
function sendLearningReport(params) {
    try {
        var userEmail = params.user_email || '';
        var userName = params.user_name || 'ユーザー';
        var score = parseInt(params.score) || 0;
        var total = parseInt(params.total) || 0;
        var percentage = parseInt(params.percentage) || 0;
        var allIds = params.all_ids || '';
        var wrongIds = params.wrong_ids || '';
        var dateStr = params.date || new Date().toISOString();

        if (!userEmail) {
            return { success: false, error: 'メールアドレスが指定されていません' };
        }

        // 日付のフォーマット
        var date = new Date(dateStr);
        var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy年MM月dd日 HH:mm');

        // 問題IDリスト
        var allIdArr = allIds ? allIds.split(',') : [];
        var wrongIdArr = wrongIds ? wrongIds.split(',') : [];

        // AIアドバイスの生成
        var advice = '';
        if (percentage >= 80) {
            advice = '素晴らしい成績です！この調子で頑張りましょう。さらに難しい問題にも挑戦してみてください。';
        } else if (percentage >= 60) {
            advice = '合格圏内の成績です。間違えた問題を復習すれば、さらに得点アップが期待できます。';
        } else {
            advice = '基礎からしっかり復習しましょう。間違えた問題を繰り返し解くことが効果的です。';
        }

        // --- PDF用：今回解いた全ての問題の詳細を取得 ---
        var pdfBlob = null;
        if (allIdArr.length > 0) {
            try {
                pdfBlob = generateQuestionsPDF(allIdArr, wrongIdArr, userName, formattedDate, score, total, percentage);
            } catch (pdfError) {
                Logger.log('PDF generation error: ' + pdfError.toString());
                // PDFエラーでもメール送信は継続
            }
        }

        // HTMLメール本文の作成
        var htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #ff6b9d, #ffc3a0); padding: 30px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 24px; }
                    .content { padding: 30px; }
                    .score-box { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 20px; }
                    .score-main { font-size: 48px; font-weight: bold; }
                    .score-sub { font-size: 18px; opacity: 0.9; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; font-weight: bold; color: #374151; margin-bottom: 10px; border-left: 4px solid #ff6b9d; padding-left: 10px; }
                    .advice-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 8px; }
                    .wrong-list { background: #fef3c7; padding: 15px; border-radius: 8px; }
                    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                    a { color: #ff6b9d; text-decoration: none; }
                    .pdf-notice { background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 12px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>[Report] LogicPulley 学習レポート</h1>
                    </div>
                    <div class="content">
                        <p>${userName}さん、お疲れ様でした！</p>
                        <p style="color: #6b7280; font-size: 14px;">${formattedDate} の演習結果</p>

                        <div class="score-box">
                            <div class="score-main">${score} / ${total}</div>
                            <div class="score-sub">正答率 ${percentage}%</div>
                        </div>

                        <div class="section">
                            <div class="section-title">★ AIアドバイス</div>
                            <div class="advice-box">
                                ${advice}
                            </div>
                        </div>

                        ${wrongIdArr.length > 0 ? `
                        <div class="section">
                            <div class="section-title">▲ 間違えた問題 (${wrongIdArr.length}問)</div>
                            <div class="wrong-list">
                                ${wrongIdArr.map(function (id) { return '<span style="display: inline-block; background: white; padding: 4px 8px; margin: 3px; border-radius: 4px; font-size: 13px;">' + id + '</span>'; }).join('')}
                            </div>
                            <p style="font-size: 13px; color: #6b7280; margin-top: 10px;">
                                これらの問題を復習することで、さらなるスコアアップが期待できます。
                            </p>
                        </div>
                        ${pdfBlob ? '<div class="pdf-notice">添付PDFに問題の詳細が記載されています。復習にご活用ください。</div>' : ''}
                        ` : '<p style="color: #10b981; font-weight: bold;">* 全問正解おめでとうございます！</p>'}
                    </div>
                    <div class="footer">
                        <p>このメールは LogicPulley Exams から自動送信されました</p>
                        <p><a href="https://logic-pulley-exams.pages.dev">LogicPulley Exams を開く</a></p>
                        <p>© 2026 LogicPulley Inc.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // メール送信オプション
        var mailOptions = {
            htmlBody: htmlBody,
            name: 'LogicPulley Exams'
        };

        // PDFがあれば添付
        if (pdfBlob) {
            mailOptions.attachments = [pdfBlob];
        }

        // メール送信
        GmailApp.sendEmail(
            userEmail,
            '[Report] LogicPulley 学習レポート - ' + formattedDate,
            '学習レポートです。HTMLメールが表示されない場合はブラウザで確認してください。',
            mailOptions
        );

        Logger.log('Report sent to: ' + userEmail + (pdfBlob ? ' (with PDF)' : ''));
        return { success: true };

    } catch (e) {
        Logger.log('Error sending report: ' + e.toString());
        return { success: false, error: e.toString() };
    }
}

/**
 * 今回解いた問題のPDFを生成する
 * @param {string[]} allIdArr - 今回解いた全ての問題ID
 * @param {string[]} wrongIdArr - 間違えた問題ID
 */
function generateQuestionsPDF(allIdArr, wrongIdArr, userName, formattedDate, score, total, percentage) {
    // スプレッドシートから問題データを取得
    var ss = SpreadsheetApp.openById(TARGET_SS_ID);
    var sheet = ss.getSheetByName('AllQuestions');
    if (!sheet) return null;

    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // ヘッダー名からカラムインデックスを取得
    var colIndex = {};
    for (var h = 0; h < headers.length; h++) {
        colIndex[String(headers[h]).toLowerCase().trim()] = h;
    }

    // カラム名の確認（デバッグ用）
    Logger.log('Available columns: ' + JSON.stringify(Object.keys(colIndex)));

    var questions = [];

    // 今回解いた全ての問題をIDで検索
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var id = String(row[colIndex['id'] || 0]);
        if (allIdArr.indexOf(id) !== -1) {
            // options_json または options カラムを探す
            var optionsColIdx = colIndex['options_json'] !== undefined ? colIndex['options_json'] : (colIndex['options'] !== undefined ? colIndex['options'] : 6);
            var optionsRaw = row[optionsColIdx];
            var options = [];
            try {
                if (optionsRaw && typeof optionsRaw === 'string') {
                    options = JSON.parse(optionsRaw);
                } else if (Array.isArray(optionsRaw)) {
                    options = optionsRaw;
                }
            } catch (e) {
                Logger.log('JSON Parse Error for ' + id + ': ' + e.toString());
                options = [];
            }

            questions.push({
                id: id,
                exam_year: row[colIndex['exam_year'] || 1],
                section: row[colIndex['section'] || 2],
                question_no: row[colIndex['question_no'] || 3],
                category: row[colIndex['category'] || 4],
                question_text: row[colIndex['question_text'] || 5],
                options: options,
                correct_idx: row[colIndex['correct_idx'] !== undefined ? colIndex['correct_idx'] : (colIndex['correct_index'] !== undefined ? colIndex['correct_index'] : 7)],
                isWrong: wrongIdArr.indexOf(id) !== -1
            });
        }
    }

    if (questions.length === 0) return null;

    // 元の順番を保持するためにソート
    questions.sort(function (a, b) {
        return allIdArr.indexOf(a.id) - allIdArr.indexOf(b.id);
    });

    // Googleドキュメントを作成
    var doc = DocumentApp.create('LogicPulley_問題集_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss'));
    var body = doc.getBody();

    // タイトル
    body.appendParagraph('LogicPulley 演習問題集').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph(userName + 'さん / ' + formattedDate);
    body.appendParagraph('成績: ' + score + ' / ' + total + ' (' + percentage + '%)');
    body.appendParagraph('');
    body.appendParagraph('--- 凡例 ---');
    body.appendParagraph('◯ = 正解した問題  /  ✕ = 間違えた問題');
    body.appendHorizontalRule();
    body.appendParagraph('');

    // 各問題を追加
    questions.forEach(function (q, idx) {
        var resultMark = q.isWrong ? '✕' : '◯';
        var heading = body.appendParagraph(resultMark + ' 問題 ' + (idx + 1) + ': ' + q.id);
        heading.setHeading(DocumentApp.ParagraphHeading.HEADING2);

        body.appendParagraph('[' + q.category + ']').setItalic(true);
        body.appendParagraph('');

        // 問題文
        body.appendParagraph('【問題】').setBold(true);
        body.appendParagraph(q.question_text);
        body.appendParagraph('');

        // 選択肢
        body.appendParagraph('【選択肢】').setBold(true);
        if (q.options && q.options.length > 0) {
            q.options.forEach(function (opt, optIdx) {
                var prefix = String(optIdx + 1) + '. ';
                var para = body.appendParagraph(prefix + opt);
                // 正解に印をつける
                var correctIndexes = String(q.correct_idx).split(',').map(function (s) { return parseInt(s.trim()); });
                if (correctIndexes.indexOf(optIdx) !== -1) {
                    para.setBold(true);
                    para.appendText('  ← 正解');
                }
            });
        }

        body.appendParagraph('');
        body.appendHorizontalRule();
        body.appendParagraph('');
    });

    // PDFにエクスポート
    doc.saveAndClose();
    var pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
    pdfBlob.setName('演習問題集_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '.pdf');

    // 一時ドキュメントを削除
    DriveApp.getFileById(doc.getId()).setTrashed(true);

    return pdfBlob;
}

/**
 * テスト用：メール送信の動作確認と権限承認
 * GASエディタでこの関数を選択して「実行」ボタンを押してください。
 * 初回実行時にGoogleの権限承認ダイアログが表示されます。
 */
function testSendReport() {
    // テスト用のパラメータ
    var testParams = {
        user_email: Session.getActiveUser().getEmail(), // 自分自身に送信
        user_name: 'テストユーザー',
        score: 3,
        total: 5,
        percentage: 60,
        all_ids: '60-AM-001,60-AM-002,60-PM-001,59-PM-015,59-AM-010',
        wrong_ids: '60-AM-001,59-PM-015',
        date: new Date().toISOString()
    };

    var result = sendLearningReport(testParams);
    Logger.log('Test result: ' + JSON.stringify(result));

    if (result.success) {
        Logger.log('✅ テストメールを送信しました！メールボックスを確認してください。');
    } else {
        Logger.log('❌ 送信失敗: ' + result.error);
    }
}
