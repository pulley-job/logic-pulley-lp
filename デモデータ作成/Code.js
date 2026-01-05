function getUrl() {
  var files = DriveApp.getFilesByName('臨床実習メンタルヘルスチェック_デモデータ');
  if (files.hasNext()) {
    var file = files.next();
    console.log('SPREADSHEET_URL: ' + file.getUrl());
  }
  
  // Also try to find the Looker Studio report URL if possible? 
  // No, Looker Studio reports are not easily accessible via DriveApp with a specific URL unless we have the ID.
}
