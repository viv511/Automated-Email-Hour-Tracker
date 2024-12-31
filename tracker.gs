/*
  NHS Hours Tracker:

  Purpose: Automate hour checking for NHS Students
  Description: Pulls data from current and last year spreadsheets, calculates roll-over hours for current seniors, manipulates data, and sends an automated email to students with their hours on request. 

  Created by Vivek Mehta, (NHS President, Class of [REDACTED])

  Note: This is a Google Apps Script, so it is written in JavaScript. It is meant to be run on Google Sheets. Furthermore, you will have to change the ID's of the spreadsheets each year.

*/

const currentSeniorYear = "[REDACTED]";
const personOfContact = "If there are any problems or issues, please reach out to [REDACTED]"

//All of our student data will be stored here
var students = {};

function runScript() {
  processStudentData();

  //Pull most recent email
  let desiredEmail = pullRecentEmail();
  sendNHSemail(desiredEmail);
}

function pullRecentEmail() {
  let submissionData = pullSheetInfo("[REDACTED]", "[REDACTED]");
  let data = submissionData.slice(1); //Remove headers, only data

  //Look for bottom-most row, 4th column (i.e. 3rd index because 0-based indexing):
  let recentEmail = data[data.length-1][3];

  return recentEmail;
}

function processStudentData() {
  //Count roll-over hrs for current seniors
  processLastYear();
  processThisYear();

  // printAllStudentInfo();
}

function processLastYear() {
  //Pull Spreadsheet Data
  let lastyrStudentData = pullSheetInfo("[REDACTED]", "[REDACTED]");

  //Process Students
  processLastYearStudents(lastyrStudentData);
}

function processLastYearStudents(studentData) {
  let headers = studentData[0];
  let studentEmail = headers.indexOf("Email");
  let studentFirst = headers.indexOf("First Name");
  let studentLast = headers.indexOf("Last Name");
  let studentNHShrs = headers.indexOf("NHS Hours");
  let studentNON_NHShrs = headers.indexOf("Non-NHS Hours");

  let onlyStudents = studentData.slice(1); //Remove headers, only data

  for(let i=0; i<onlyStudents.length; i++) {
    let sampleStudent = onlyStudents[i];

    let email = sampleStudent[studentEmail];

    //".trim()" Because people always add extra spaces for no reason :(
    let studentName = sampleStudent[studentFirst].trim() + " " + sampleStudent[studentLast].trim();

    students[email] = {
      "name": studentName,
      "grade": 12,
      "nhs": 0.0,
      "nonnhs": 0.0
    };

    let neededNHS = 15.0;
    let neededNON_NHS = 5.0;

    let completedNHS = specialRound(sampleStudent[studentNHShrs])
    let completedNON_NHS = specialRound(sampleStudent[studentNON_NHShrs]);

    //Roll-over hours logic
    
    let excessNHShrs = (completedNHS - neededNHS);

    if(completedNON_NHS < neededNON_NHS) {
      let neededNonNHShrs = (neededNON_NHS - completedNON_NHS);
      
      students[email]["nhs"] = specialRound(excessNHShrs - neededNonNHShrs);
    }
    else {
      let excessNON_NHShrs = (completedNON_NHS - neededNON_NHS);

      students[email]["nhs"] = specialRound(excessNHShrs);
      students[email]["nonnhs"] = specialRound(excessNON_NHShrs);
    }

  }

}

function processThisYear() {
  let thisyrStudentData = pullSheetInfo("[REDACTED]", "[REDACTED]");

  processThisYearStudents(thisyrStudentData);
}

function processThisYearStudents(studentData) {
  let headers = studentData[0];

  let studentEmail = headers.indexOf("Email Address");
  let studentName = headers.indexOf("What is your full name? (Please make sure you inputted your school email on the question above)");
  let studentGrade = headers.indexOf("What is your grade?");
  let studentHoursType = headers.indexOf("Did this project count for NHS hours or non-NHS hours?");
  let studentHours = headers.indexOf("How many hours of community service was this project for?");

  let onlyStudents = studentData.slice(1); //Remove headers, only data

  for(let i=0; i<onlyStudents.length; i++) {
    let sampleStudent = onlyStudents[i];

    let email = sampleStudent[studentEmail];

    if(!students[email]) { //Create new student if they aren't in the array already
      let fullName = sampleStudent[studentName];
      let hsGrade = sampleStudent[studentGrade];

      if(hsGrade === "Senior (YOG " + currentSeniorYear + ")") {
        hsGrade = 12;
      }
      else {
        hsGrade = 11;
      }

      students[email] = {
        "name": fullName,
        "grade": hsGrade,
        "nhs": 0.0,
        "nonnhs": 0.0
      };
    }

    //Now that each student has been added, add the hours
    let typeOfHours = sampleStudent[studentHoursType];
    let hoursToAdd = specialRound(sampleStudent[studentHours]);
  
    if(typeOfHours === "NHS hours") {
      students[email]["nhs"] += specialRound(hoursToAdd);
    }
    else {
      students[email]["nonnhs"] += hoursToAdd;
    }
  }
}

function pullSheetInfo(sheetID, pageID) {
  let sheet = SpreadsheetApp.openById(sheetID);
  let page = null;

  let allPages = sheet.getSheets();
  for(let p of allPages) {
    if(p.getSheetId() == pageID) {
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

//Take our string --> float --> Round to 2 decimal places
function specialRound(input) {

  //Because I'm lazy :( idk if theres a better way to do this
  return Math.round(parseFloat(input) * 100) / 100;
}

function checkHours(email, prettyFormatting) {
  let emailedMessage = "";
  const yay = "You meet all of the NHS hour requirements. Nice job! :)";
  const nay = "Sorry, you do not meet the criteria for NHS and Non-NHS hour requirements. :("

  let student = students[email];
  const srNHSmin = 10.0
  const jrNHSmin = 15.0
  const totalMin = 20.0

  if(student) {
    emailedMessage += printStudentInfo(email, prettyFormatting);

    let name = students[email]["name"];
    let grade = students[email]["grade"];
    let nhsHrs = students[email]["nhs"];
    let nonnhsHrs = students[email]["nonnhs"];
    let totalHrs = nhsHrs + nonnhsHrs;

    //Everyone needs min 20 total
    if(grade == 12) { //Min 10 NHS
      if((nhsHrs >= srNHSmin) && (totalHrs >= totalMin)) {
        emailedMessage += "\n\n" + yay;
      }
      else {
        emailedMessage += "\n\n" + nay;
        emailedMessage += "\n" + "As a senior, you must have a minimum of " + srNHSmin + " NHS hours and a total of " + totalMin + " overall hours."
      }
    }
    else {
      if((nhsHrs >= jrNHSmin) && (totalHrs >= totalMin)) {
        emailedMessage += "\n\n" + yay;
      }
      else {
        emailedMessage += "\n\n" + nay;
        emailedMessage += "\n" + "As a junior, you must have a minimum of " + jrNHSmin + " NHS hours and a total of " + totalMin + " overall hours."
      }
    }
  }
  else {
    emailedMessage += "Error: This student's email does not exist!";
  }

  emailedMessage += "\n\nNOTE: This is an automated message. " + personOfContact;

  return emailedMessage;
}

function sendNHSemail(recipientEmail) {
  const subject = "NHS Hours for " + students[recipientEmail]["name"];
  let body = checkHours(recipientEmail, true);

  //Replace "\n" with "<br>" for HTML formatting!! :)
  body = "<html><body>" + body.replace(/\n/g, "<br>") + "</body></html>";

  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    htmlBody: body
  });
}

function printAllStudentInfo() {
  for(var email in students) {
    Logger.log(printStudentInfo(email, false));
  }
}

function printStudentInfo(email, prettyFormatting) {
  studentData = students[email];
  var gr = null;
  if(studentData.grade == 12) {
    gr = 12;
  }
  else {
    gr = 11;
  }
  
  let msg = "";

  if(prettyFormatting) { //For emailing
    msg += "Hi " + studentData.name + "! You have " + studentData.nhs + " NHS hours and " + studentData.nonnhs + " Non-NHS Hours completed."
  }
  else { //For debugging
    msg += email + " — Name: " + studentData.name + " (" + gr +")" + ", NHS: " + studentData.nhs + ", Non-NHS: " + studentData.nonnhs;
  } 

  return msg;
} 
