//This file contains the functions that send emails to students regarding their NHS hours.

const personOfContact = "If there are any problems or issues, please reach out to [REDACTED]"

function sendNHSemail(recipientEmail) {
  const subject = "NHS Hours for " + students[recipientEmail]["name"] + " — " + pullRecentDate();
  
  //Replace "\n" with "<br>" for HTML formatting
  let body = checkHours(recipientEmail, true).replace(/\n/g, "<br>");
  let msg = "<html><body>" + body + "</body></html>";

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
  const yay = "You meet all of the NHS hour requirements. Nice job! :)";
  const nay = "Sorry, you do not meet the criteria for NHS and Non-NHS hour requirements. :("

  let student = students[email];
  const srNHSmin = 10.0
  const jrNHSmin = 15.0
  const totalMin = 20.0

  if (student) {
    emailedMessage += printStudentInfo(email, prettyFormatting);

    let name = students[email]["name"];
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