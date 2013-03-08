Conditional Fields
==========

This New Zendesk app will show and hide fields based on the value of a dropdown. This app requires some basic knowledge of javascipt and JSON to configure. 

The configuration is a two step process where you have to edit the app.js file to configure your watched fields in the events object. Also adding varibles in capture the value of the watched fields. Watched fields are the fields that when a option is selected other fields will either be hidden or become visible. 

In app.js you will see a javascript object called events:

``` javascript
    events: {
      'app.activated':  'init',
      'requiredProperties.ready': 'toggleFields',
      'ticket.custom_field_21631456.changed': 'toggleFields'
    }
```

The key ``` 'ticket.custom_field_21631456.changed' ``` is a watched field. For each watched field you need to add a new key and action. ``` 'toggleFields' ``` is the action to take when field 21631456 is changed, in this case if fires a function. In the function we get the value of 21631456 and using the JSON that was set in the settings page we get the array of fields to act upon. 

The JSON object needs to look like: 

``` javascript
{"cat":[21875871,21865183,21745801], "dog":[22103126,21613267], "dolphin": [280865, 20295661], "the_fish": []}
```

Each key is a option value in the drop down field that is being watched, in this case 21631456. Each key needs an array of ticket field ID's to show when that value is selected. Please read up on the formating of JSON objects at [Introducing JSON](http://json.org/) . 