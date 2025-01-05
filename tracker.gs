//Created by Vivek Mehta, (NHS President, Class of 2025)

function runScript() {
  processStudentData();

  //Fetch the most recent email from the Google Form
  const desiredEmail = pullRecentEmail();
  sendNHSemail(desiredEmail);
}