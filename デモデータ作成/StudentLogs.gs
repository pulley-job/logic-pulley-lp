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
            'correct_answer',
            'confidence'  // 'high', 'medium', 'low'
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
            params.correct_answer || '',         // correct_answer
            params.confidence || 'unknown'       // confidence
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

        // Get questions that need review (wrong OR guessed with low confidence)
        // Row indices: 6 = is_correct, 9 = confidence
        var reviewRows = userRows.filter(function (row) {
            var isCorrect = row[6];
            var confidence = row[9]; // confidence column (high, medium, low)

            // Include if: wrong OR (correct but guessed/low confidence)
            return isCorrect === false || confidence === 'low';
        }).slice(-20).reverse();

        var recentWrongQuestions = reviewRows.map(function (row) {
            return {
                question_id: row[3],
                category: row[4],
                timestamp: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
                selected_answer: row[7], // selected_answer column
                correct_answer: row[8],  // correct_answer column
                is_correct: row[6],      // to show if it was actually correct
                confidence: row[9]       // confidence level
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
