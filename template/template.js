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

function getHeaderIndex(data, headerName) {
    let headers = data[0];
    let headerIndex = headers.indexOf(headerName);

    return headerIndex;
}

function getColumn(data, headerName) {
    let onlyData = data.slice(1);
    let headerIndex = getHeaderIndex(data, headerName);

    //If the header doesn't exist, return an empty array
    if (headerIndex == -1) {
        return [];
    }
    
    //Grabs each row's value at the header index and returns it as an array using map
    return onlyData.map(row => row[headerIndex]); 
}

function sendSimpleEmail(recipient, subject, body) {
    MailApp.sendEmail(recipient, subject, body);
}

function sendHTMLEmail(recipient, subject, body) {
    //Appends the most recent date to the subject
    subject = subject + " — " + pullRecentDate();

    //Converts the body to HTML format
    body = "<html><body>" + body.replace(/\n/g, "<br>"); + "</body></html>";

    MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: body
    });
}

function pullRecentDate() {
    //Google Forms usually adds the timestamp as the first column as "Timestamp"
    let data = data[data.length-1][getHeaderIndex(data, "Timestamp")];

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

    //Return the formatted date in MM/DD/YY HH:MM AM/PM format
    return formattedDate;
}