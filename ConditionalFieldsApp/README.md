Conditional Fields
==========

This New Zendesk app will show and hide fields based on the value of a dropdown. 

Because of the customizable nature required from the code there isn't a way of handling the configuration from the settings page, so all configuration is done in the code. Conditional fields are designed to simplify workflow. Take some time and think about the fields you need and when they should be displayed. The basic working block of conditional fields is the array. You will build arrays of ticket field id's you which to effect when the option is selected from a monitor field.
 
```javascript
var projectRequest = ['280865','223223'];
var otherHelpesk = ['279466'];
```

The changes to the monitor fields have event handlers which can fire functions ```.changed``` . ```app.activated``` is a special hander that fires when the app first loads or a new tab in the app is opened. 

```javascript
events: {
  'app.activated': 'setValue',
  'ticket.custom_field_21631456.changed': 'typeII'
},
```

The function that controls what happens when a montior option is selected uses to helper functions ```show(fields)``` and ```hide(fields)``` where *fields* is an array of ticket field id's which is returned from a hash map. 

```javascript
typeII: function(){
  this.hide(hideAll);
  this.type2thing = this.ticket().customField('custom_field_21631456');
  //console.log('control field value: ' + this.type2thing);
  if (this.type2thing != null) {
   this.show(moodFieldMap[this.type2thing]);
  }
},
```
