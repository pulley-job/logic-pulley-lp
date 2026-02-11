/**
 * 国試夢想ダイナミック・データベース
 * メインエントリポイント
 */

// スプレッドシートID（設定が必要）
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

/**
 * Webアプリとしてアクセスされた時のエントリポイント
 */
function doGet(e) {
  const page = e.parameter.page || 'main';
  
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('国試夢想ダイナミック・データベース')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * HTMLファイル内で他のファイルをインクルードするためのヘルパー
 * @param {string} filename - インクルードするファイル名
 * @return {string} ファイルの内容
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 設定情報を取得
 */
function getConfig() {
  return {
    spreadsheetId: SPREADSHEET_ID,
    isConfigured: !!SPREADSHEET_ID
  };
}

/**
 * スプレッドシートIDを設定
 */
function setSpreadsheetId(id) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
  return { success: true };
}

/**
 * 問題を検索
 * @param {Object} criteria - 検索条件
 */
function searchQuestions(criteria) {
  try {
    const results = SearchEngine.search(criteria);
    return { success: true, data: results };
  } catch (error) {
    console.error('検索エラー:', error);
    return { success: false, error: error.message };
  }
}

/**
 * カテゴリマスターを取得
 */
function getCategories() {
  try {
    const categories = SheetService.getCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error('カテゴリ取得エラー:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 年度一覧を取得
 */
function getYears() {
  try {
    const years = SheetService.getYears();
    return { success: true, data: years };
  } catch (error) {
    console.error('年度取得エラー:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 問題をエクスポート
 * @param {Array} questionIds - エクスポート対象の問題ID
 * @param {string} format - 出力形式（googledoc/pdf/word）
 * @param {string} type - 出力タイプ（questions/answers/full）
 */
function exportQuestions(questionIds, format, type) {
  try {
    const result = ExportService.export(questionIds, format, type);
    return { success: true, data: result };
  } catch (error) {
    console.error('エクスポートエラー:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 問題をインポート
 * @param {string} sourceSpreadsheetId - インポート元スプレッドシートID
 */
function importQuestions(sourceSpreadsheetId) {
  try {
    const result = ImportService.importFromSpreadsheet(sourceSpreadsheetId);
    return { success: true, data: result };
  } catch (error) {
    console.error('インポートエラー:', error);
    return { success: false, error: error.message };
  }
}

/**
 * インポート用テンプレートを作成
 */
function createImportTemplate() {
  try {
    const result = ImportService.createTemplate();
    return { success: true, data: result };
  } catch (error) {
    console.error('テンプレート作成エラー:', error);
    return { success: false, error: error.message };
  }
}
