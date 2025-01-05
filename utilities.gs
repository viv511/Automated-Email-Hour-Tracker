//This file includes all of the utility functions pertaining to scraping, debugging, formatting, and rounding.

function pullRecentEmail() {
  let submissionData = pullSheetInfo("[REDACTED]", "[REDACTED]");
  let data = submissionData.slice(1); //Remove headers, only data

  //Emails are placed in the fourth column, pick the bottom-most row
  let headers = submissionData[0];
  let emailColumnIndex = headers.indexOf("School Email:");
  let recentEmail = data[data.length-1][emailColumnIndex];

  return recentEmail;
}

function pullSheetInfo(sheetID, pageID) {
  let sheet = SpreadsheetApp.openById(sheetID);
  let page = null;

  let allPages = sheet.getSheets();
  for(let p of allPages) {
    if (p.getSheetId() == pageID) {
      page = p;
      break;
    }
  }

  let lastRow = page.getLastRow();
  let lastCol = page.getLastColumn();
  let studentRange = page.getRange(1,1, lastRow, lastCol);
  let studentData = studentRange.getValues();

  return studentData;
}

function printAllStudentInfo() {
  for(var email in students) {
    Logger.log(printStudentInfo(email, false));
  }
}

function printStudentInfo(email, prettyFormatting) {
  studentData = students[email];
  let gr = null;
  if (studentData.grade == 12) {
    gr = 12;
  }
  else {
    gr = 11;
  }
  
  let msg = "";

  if (prettyFormatting) { //For emailing
    msg += "Hi " + studentData.name + "! You have " + studentData.nhs + " NHS hours and " + studentData.nonnhs + " Non-NHS Hours completed."
  }
  else { //For debugging
    msg += email + " — Name: " + studentData.name + " (" + gr +")" + ", NHS: " + studentData.nhs + ", Non-NHS: " + studentData.nonnhs;
  } 

  return msg;
} 

  //String to float, round to 2 decimal places
function specialRound(input) {
  return Math.round(parseFloat(input) * 100) / 100;
}
  