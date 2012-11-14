Zendesk Simple Time Tracking
==========

If you need to record accumulated time that is worked on a ticket it takes input from the current user and adds it to time already recored. A log is also stored on a free text field of who made the entry, the time added, and the date. When added the app to your account you need to create two fields. One is a regex field for the time I would recommend ``` ^\d*\d:\d\d$ ``` as the condition to test. The second field is a multi-line text field. Record both of the text field IDs for the settings page. 
