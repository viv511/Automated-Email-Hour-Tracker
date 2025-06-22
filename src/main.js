/*
Automated Hours Tracker (w/ Google Apps Script)

Purpose:
Automate hour checking for National Honors Society (NHS) Students. We have 300+ students participating in NHS each year, so manually accumulating hours is infeasible. Furthermore, the hours need to be sorted by non-NHS and NHS-specific hours, with different criteria based on grade level. This was the motivation to create this code—make the process simpler not just for the students, but also for the NHS leadership to verify, calculate, and award people's community service.

Description:
This script pulls data from current and last year spreadsheets, calculates roll-over hours for current seniors, manipulates data, and sends an automated email to students with their hours on request. This was written in Google Apps Script and is meant to be run with Google Sheets.

Note: For future maintainers, please talk to the Tech Office to grant Apps Script access to your school email.
Please reach out to <dwininger@lexingtonma.org>.

Author
Created by Vivek Mehta, (NHS President, Class of 2025)
https://github.com/viv511
*/

//All of our student data will be stored here
var students = {};

//Some constants for the NHS hour requirements
const srNHSmin = 10.0
const jrNHSmin = 15.0
const totalMin = 20.0

//Person of Contact Information
const personOfContactEmail = "[REDACTED]";
const personOfContact = "If there are any problems or issues, please reach out to [Person of Contact Name], " + personOfContactEmail;
const currentSeniorYear = "[REDACTED]";

//Messages for email
const yay = "You meet all of the hour requirements. Nice job! :)";
const nay = "Sorry, you do not meet the criteria for the hour requirements. :("

function runScript() {
  processStudentData();

  //Fetch the most recent email from the Google Form
  const desiredEmail = pullRecentEmail();
  sendNHSemail(desiredEmail);
  
  // inductionListGenerator()
}

function processStudentData() {
  addAllStudents();

  processLastYear();
  processThisYear();

  // Logger.log(printAllStudentInfo());
}

function addAllStudents() {
  addAllSeniors();
  addAllJuniors();
}

function addAllSeniors() {
  let allSeniorData = pullSheetInfo("[REDACTED]", "[REDACTED]");
  let headers = allSeniorData[0];

  let srEmail = headers.indexOf("Email");
  let srFirstName = headers.indexOf("First Name");
  let srLastName = headers.indexOf("Last Name");

  let onlySeniors = allSeniorData.slice(1);

  for(let i=0; i<onlySeniors.length; i++) {
    let sampleSr = onlySeniors[i];
    let email = sampleSr[srEmail];

    let fullName = sampleSr[srFirstName] + " " + sampleSr[srLastName];
    students[email] = {
      "name": fullName,
      "grade": 12,
      "nhs": 0.0,
      "nonnhs": 0.0
    };
  }
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
  let studentNHShrs = headers.indexOf("NHS Hours");
  let studentNON_NHShrs = headers.indexOf("Non-NHS Hours");

  let onlyStudents = studentData.slice(1); //Remove headers, only data

  for(let i=0; i<onlyStudents.length; i++) {
    let sampleStudent = onlyStudents[i];
    let email = sampleStudent[studentEmail];

    let neededNHS = 15.0;
    let neededNON_NHS = 5.0;

    let completedNHS = specialRound(sampleStudent[studentNHShrs])
    let completedNON_NHS = specialRound(sampleStudent[studentNON_NHShrs]);

    //Roll-over hours logic
    
    let excessNHShrs = (completedNHS - neededNHS);

    // Logger.log(students[email]);
    if(completedNON_NHS < neededNON_NHS) {
      let neededNonNHShrs = (neededNON_NHS - completedNON_NHS);
      students[email].nhs = specialRound(excessNHShrs - neededNonNHShrs);
    }
    else {
      let excessNON_NHShrs = (completedNON_NHS - neededNON_NHS);

      students[email].nhs = specialRound(excessNHShrs);
      students[email].nonnhs = specialRound(excessNON_NHShrs);
    }
  }
}

function addAllJuniors() {
  let allJuniorData = pullSheetInfo("[REDACTED]", "[REDACTED]");
  let headers = allJuniorData[0];

  let jrEmail = headers.indexOf("Email");
  let jrFirstName = headers.indexOf("First Name");
  let jrLastName = headers.indexOf("Last Name");

  let onlyJuniors = allJuniorData.slice(1);

  for(let i=0; i<onlyJuniors.length; i++) {
    let sampleJr = onlyJuniors[i];
    let email = sampleJr[jrEmail];

    let fullName = sampleJr[jrFirstName] + " " + sampleJr[jrLastName];
    
    students[email] = {
      "name": fullName,
      "grade": 11,
      "nhs": 0.0,
      "nonnhs": 0.0
    };
  }

}

function processThisYear() {
  let thisyrStudentData = pullSheetInfo("[REDACTED]", "[REDACTED]");

  processThisYearStudents(thisyrStudentData);
}

function processThisYearStudents(studentData) {
  let headers = studentData[0];

  let studentEmail = headers.indexOf("Email Address");
  let studentHoursType = headers.indexOf("Did this project count for NHS hours or non-NHS hours?");
  let studentHours = headers.indexOf("How many hours of community service was this project for?");

  let onlyStudents = studentData.slice(1); //Remove headers, only data

  for(let i=0; i<onlyStudents.length; i++) {
    let sampleStudent = onlyStudents[i];
    let email = sampleStudent[studentEmail];
    
    //Send an email to the person of contact if there is an error (email is not in the students object)
    if (!students[email]) {
      MailApp.sendEmail({
        to: personOfContactEmail,
        subject: "Email Error, Please fix soon!",
        htmlBody: "Skipping email (no student data found): " + email
      });
      continue;
    }

    let typeOfHours = sampleStudent[studentHoursType];
    let hoursToAdd = specialRound(sampleStudent[studentHours]);

    if(typeOfHours === "NHS hours") {
      students[email].nhs += hoursToAdd;
    }
    else {
      students[email].nonnhs += hoursToAdd;
    }

  }
}

function sendNHSemail(recipientEmail) {
  const subject = "NHS Hours for " + students[recipientEmail]["name"] + " — " + pullRecentDate();
  
  //Replace "\n" with "<br>" for HTML formatting
  let body = checkHours(recipientEmail, true).replace(/\n/g, "<br>");
  let msg = "<html><body>" + body + "</body></html>";

  // Logger.log(msg);

  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    htmlBody: msg
  });
}

function pullRecentDate() {
  let submissionData = pullSheetInfo("[REDACTED]", "[REDACTED]");
  let data = submissionData.slice(1); //Remove headers, only data

  let headers = submissionData[0];
  let dateColumnIndex = headers.indexOf("Timestamp");
  let recentDate = data[data.length-1][dateColumnIndex];

  return formatDate(recentDate);
}

function formatDate(date) {
  let month = date.getMonth() + 1;  
  let day = date.getDate();
  let year = date.getFullYear() % 100;  
  let hours = date.getHours();
  let minutes = date.getMinutes();

  ampm = "";
  if (hours >= 12) {
    ampm = "PM";
  }
  else {
    ampm = "AM";
  }

  hours %= 12; //12-hr format

  if (hours == 0) { //Noon/Midnight edge-case
    hours = 12;
  }

  //Minutes single-digit edge case
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  // Format the date as MM/DD/YY
  let formattedDate = month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ' ' + ampm;

  return formattedDate;
}

function checkHours(email, prettyFormatting) {
  let emailedMessage = "";
  let student = students[email];

  if (student) {
    emailedMessage += printStudentInfo(email, prettyFormatting);

    let grade = students[email]["grade"];
    let nhsHrs = students[email]["nhs"];
    let nonnhsHrs = students[email]["nonnhs"];
    let totalHrs = nhsHrs + nonnhsHrs;

    //Everyone needs min 20 total
    if (grade == 12) { //Min 10 NHS
      if ((nhsHrs >= srNHSmin) && (totalHrs >= totalMin)) {
        emailedMessage += "\n\n" + yay;
      }
      else {
        emailedMessage += "\n\n" + nay;
        emailedMessage += "\n" + "As a senior, you must have a minimum of " + srNHSmin + " NHS hours and a total of " + totalMin + " overall hours."
      }
    }
    else {
      if ((nhsHrs >= jrNHSmin) && (totalHrs >= totalMin)) {
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

function pullRecentEmail() {
  let submissionData = pullSheetInfo("[REDACTED]", "[REDACTED]");
  let data = submissionData.slice(1); //Remove headers, only data

  //Emails are placed in the fourth column, pick the bottom-most row
  let headers = submissionData[0];
  let emailColumnIndex = headers.indexOf("Email Address");
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
  let debugString = "";
  for(var email in students) {
    debugString += printStudentInfo(email, false);
  }

  return debugString;
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
    msg += email + " — Name: " + studentData.name + " (" + gr +")" + ", NHS: " + studentData.nhs + ", Non-NHS: " + studentData.nonnhs + "\n";
  } 

  return msg;
} 

  //String to float, round to 2 decimal places
function specialRound(input) {
  return Math.round(parseFloat(input) * 100) / 100;
}
  
let PUBLIC_DATA_ONLY = false;
//False ==> All student names, # of NHS hours, # of non-NHS hours, and email
//True ==> Only student names and emails (for public display)

//USE FOR INDUCTION CEREMONY COMPILATION OF DETAILS/INFORMATION
//This is pretty jank-ily written but it'll do the job
function inductionListGenerator() {
  const sheet = SpreadsheetApp.openById("[REDACTED]");
  const publicNamesPage = sheet.getSheetById("[REDACTED]");
  const completedPage = sheet.getSheetById("[REDACTED]");
  const incompletePage = sheet.getSheetById("[REDACTED]");
  const publicHeaders = [["Full Name", "Email"]];
  const inductionHeaders = [["Last Name", "First Name", "Grade", "NHS Hours", "Non-NHS Hours", "Email"]];

  //CLEAR SHEET
  publicNamesPage.clear();
  completedPage.clear()
  incompletePage.clear();
  SpreadsheetApp.flush();

  let completeRowCounter = 2;
  let incompleteRowCounter = 2;

  publicNamesPage.getRange(1, 1, 1, publicHeaders[0].length).setValues(publicHeaders);
  completedPage.getRange(1, 1, 1, inductionHeaders[0].length).setValues(inductionHeaders);
  incompletePage.getRange(1, 1, 1, inductionHeaders[0].length).setValues(inductionHeaders);

  for(var email in students) {
    let name = students[email]["name"];
    let grade = students[email]["grade"];
    let nhsHrs = students[email]["nhs"];
    let nonnhsHrs = students[email]["nonnhs"];
    let totalHrs = nhsHrs + nonnhsHrs;

    //Sort by last name
    let [firstName, lastName] = name.trim().split(" ");

    let targetSheet = null;
    let color = null;

    if(PUBLIC_DATA_ONLY) {
      if(grade !== 12 && nhsHrs >= 5 && totalHrs >= totalMin) {
        targetSheet = publicNamesPage;
        let fullName = firstName + " " + lastName;
        targetSheet.getRange(completeRowCounter, 1, 1, publicHeaders[0].length).setValues([[fullName, email]]);
        completeRowCounter++;
      }
    }
    else {
      if(grade === 12 && nhsHrs >= 10 && totalHrs >= totalMin) {
        color = "#A7F3D0"; //green - senior done
        targetSheet = completedPage;
        targetSheet.getRange(completeRowCounter, 1, 1, inductionHeaders[0].length).setValues([[lastName, firstName, grade, nhsHrs, nonnhsHrs, email]]);
        targetSheet.getRange(completeRowCounter, 1, 1, inductionHeaders[0].length).setBackground(color);
        completeRowCounter++;
      }
      else if(grade !== 12 && nhsHrs >= 5 && totalHrs >= totalMin) {
        color = "#ADD8E6" //blue - junior done
        targetSheet = completedPage;
        targetSheet.getRange(completeRowCounter, 1, 1, inductionHeaders[0].length).setValues([[lastName, firstName, grade, nhsHrs, nonnhsHrs, email]]);
        targetSheet.getRange(completeRowCounter, 1, 1, inductionHeaders[0].length).setBackground(color);
        completeRowCounter++;
      }
      else {
        color = "#F8D7DA"; //red
        targetSheet = incompletePage;
        targetSheet.getRange(incompleteRowCounter, 1, 1, inductionHeaders[0].length).setValues([[lastName, firstName, grade, nhsHrs, nonnhsHrs, email]]);
        targetSheet.getRange(incompleteRowCounter, 1, 1, inductionHeaders[0].length).setBackground(color);
        incompleteRowCounter++;
      }
    }
  }
}
