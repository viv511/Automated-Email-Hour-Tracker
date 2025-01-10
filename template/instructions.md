Table of Contents
=================

* [How to use this template!](#how-to-use-this-template)
* [Logging!](#logging)
* [Spreadsheet Data Functions](#spreadsheet-data-functions)
  * [Pulling all data from a sheet](#pulling-all-data-from-a-sheet)
  * [Grabbing specific columns](#grabbing-specific-columns)
  * [Removing headers](#removing-headers)
  * [WARNING! Cell Notation / Common Mistakes](#warning-cell-notation--common-mistakes)
* [Emails](#emails)
    * [Simple Email:](#simple-email)
    * [HTML Email w/ Time-stamped Subject:](#html-email-w-time-stamped-subject)

# How to use this template!
I've added the sample functions you need in the [template.gs](template.gs) file. You can copy and paste these functions into your Google Apps Script project. I've attached text-based instructions and examples below to help you understand how to use these functions. :) 

happy coding!!

# Logging!
The `Logger.log()` function is used to log data to the Google Apps Script console. This is useful for debugging and checking if the data is being pulled correctly. 

# Spreadsheet Data Functions
## Pulling all data from a sheet
Every Google spreadsheet is written in this format:

docs.google.com/spreadsheets/d/**[SHEET ID]**/edit?gid=**[PAGE ID]**#gid=**[PAGE ID]**
The "SHEET ID" and "PAGE ID" are unique to each spreadsheet and page. These IDs are used to access the data in the script. Pass these IDs as strings into the `pullSheetInfo()` function to access the data.

Example:
```javascript
let sheetID = "1234567890";
let pageID = "0987654321";

let data = pullSheetInfo(sheetID, pageID);
```

## Grabbing specific columns
The data is returned as a 2D array. You can access the data by using the row and column index. Often times, spreadsheets have headers in the first row. You can use the `getHeaderIndex()` function to get the index of the header you want to access. Simply pass in a string of the header name and it will return the column index.

You might be wondering, why do we need this? Well, it's easier to access data by using the header name rather than the column index (hard-coding it). This way, if the spreadsheet changes, you don't have to change the column index in the script. 

Example:
```javascript
let data = pullSheetInfo(sheetID, pageID);
let name = "What is your name?";
let nameIndex = getHeaderIndex(data, name); //Returns the column index of the header "What is your name?"
```

The entire column can now be accessed by looping through the data array and accessing the column index.

Example:
```javascript
let data = pullSheetInfo(sheetID, pageID);
let name = "What is your name?";

let nameData = getColumn(data, name);
```

## Removing headers
If you want just the data, simply slice the array to remove the first row (headers).

Example:
```javascript
let data = pullSheetInfo(sheetID, pageID);
let onlyData = data.slice(1);
```

## WARNING! Cell Notation / Common Mistakes
Although our data is in a standard row, column format, Google Sheets stores information in cells like "A1", "B2", etc. The alphabets are the column indexes and numbers are the row indexes. When you access the data, remember to use the row and column indexes accordingly. Furthermore, unlike Google Sheets, the indexes are 0-based, so the first row is index 0, the first column is index 0, etc.

Example:
```javascript
//Accessing data from B5 cell
//B = 2nd column, 5 = 5th row
//Using 0-based index, column = 1, row = 4

Logger.log("B5 is equal to " + data[4][1]); 
```

With these functions, you should be ready to access and manipulate data from Google Sheets.

# Emails

## Simple Email:
To write a simple email to a recipient, you need:
1. Recipient's email
2. Subject of the email
3. Body of the email
 
*You may need to provide Google Apps Script with the proper authorization to send emails. This can be done by running the function and allowing the necessary permissions.*

Example:
```javascript
let recipient = "clarkKent@superman.com";
let subject = "Hello Superman!";
let body = "I think Batman is cooler. What do you think?";

sendSimpleEmail(recipient, subject, body);
```

## HTML Email w/ Time-stamped Subject:
I prefer to send HTML emails because they look nicer (w/ text-wrapping, images, etc.). The subject can be time-stamped to ensure that the email is unique. The time-stamp requires there to be a time-stamp column in the spreadsheet. You may have to change the header name, but if you created the spreadsheet from a Google Forms, you should be fine (its usually automatically the first column). 


Example:
```javascript
let recipient = "clarkKent@superman.com";
let subject = "Hello Superman!";
let body = "I think Batman is cooler. What do you think? \n This is more of a complicated email, so I'm introducing line breaks. \n <b> This is bold text. </b> Notice the use of HTML tags to bold the message. The function automatically converts the slash-n to HTML line breaks, but feel free to directly use the <br> tag.";

sendHTMLEmail(recipient, subject, body);
```

## Automated emailing!
To send an automated email, you can use the "triggers" feature in Google Apps Script. This allows you to run the function at a specific time. For instance, I set this NHS hour tracker to run a specific function on a new Google Forms submission. This function included the logic to calculate the hours and send an email to the student.

That's about it for the template! If you have any questions, feel free to reach out. :D

~viv511