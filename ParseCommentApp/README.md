Zendesk Parse Comment
==========

This app is to be used in conjection with a enterprise account with "Apply marcos after update" So can pull the data from the ticket and use it. The app looks to see if the email custom field is empty. If it's empty the function calls the audit log and looks for a key at the beginning of the string. currently it's set to ```xkcd``` this could be set to anything. After it finds the comment with the key string the rest of the string is split up and each object is regex'd for the email pattern. ```/^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$/``` 

