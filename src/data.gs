//This file accumulates all student data in the students array

const currentSeniorYear = "[REDACTED]";

//All of our student data will be stored here
var students = {};

function processStudentData() {
    processLastYear();
    processThisYear();
  
    //For debugging:
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
  
      //Removing extra spaces
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
  
      if (completedNON_NHS < neededNON_NHS) {
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
  
      if (!students[email]) { //Create new student if they aren't in the array already
        let fullName = sampleStudent[studentName];
        let hsGrade = sampleStudent[studentGrade];
  
        if (hsGrade === "Senior (YOG " + currentSeniorYear + ")") {
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
    
      if (typeOfHours === "NHS hours") {
        students[email]["nhs"] += specialRound(hoursToAdd);
      }
      else {
        students[email]["nonnhs"] += hoursToAdd;
      }
    }
  }