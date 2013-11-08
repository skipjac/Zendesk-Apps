Conditional Fields
==========

This New Zendesk app will show and hide fields based on the value of a dropdown and clear out values from hidden fields. This app requires some basic knowledge of javascipt and JSON to configure. 

The JSON object for the settings page needs to look like: 

``` javascript
{"custom_field_21631456": {"cat":["custom_field_21875871","custom_field_21865183","custom_field_21745801"], "dog":["custom_field_22103126","custom_field_21613267"], "dolphin": ["custom_field_280865", "custom_field_20295661"], "the_fish": ["custom_field_279466"]}, "custom_field_279466":{"asdf":["custom_field_21651413"], "xfer_to_a": [], "fire_to_new_page": []}}
```

Each key is a option value in the drop down field that is being watched, in this case 21631456. Each key needs an array of ticket field ID's to show when that value is selected. Please read up on the formating of JSON objects at [Introducing JSON](http://json.org/)

![setttings page](http://skipjack.info/wp-content/gallery/tech/conditionalfields.png "Settings Page Example")