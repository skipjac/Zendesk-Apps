Required Fields App
==========

This New Zendesk app fill force agents in your Zendesk to fill out required fields before they can submit a update to a ticket. They can be any field you want with in the system, you just have to define them in the code. 

```javascript
var firstField = this.getFieldValue(this.ticket().customField('custom_field_21631456'));
var secondField = this.getFieldValue(this.ticket().customField('custom_field_21613267'));
var thirdField = this.getFieldValue(this.ticket().customField('custom_field_280865'));
var checkedFields = [firstField, secondField, thirdField];
```

Then just set up events to monitor changes in those fields. 

```javascript
events: {
  'app.activated': 'setValue',
  'ticket.custom_field_21631456.changed': 'typeII',
  'ticket.custom_field_21613267.changed': 'typeII',
  'ticket.custom_field_280865.changed': 'typeII'
}, //end events
```

The ```getFieldValue``` function looks at the returned value from the ticket API call and see if it is returned ```undefined, null or empty``` this is becuase in Zendesk if the ticket field did exist when th ticket was created it's not saved to the ticket in the database. 

```javascript
getFieldValue: function (fieldValue) { 
   var thereAreNulls = [undefined, null, '', 'no'];
    if(_.indexOf(thereAreNulls, fieldValue) === -1) {
      return fieldValue;
    } else {
      return '';
    }
  }
  ```