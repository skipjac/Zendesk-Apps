(function(){
  var projectRequest = ['280865'],
      otherHelpesk = ['279466'],
      hideAll = [].concat(projectRequest, otherHelpesk),
      moodFieldMap = {
        cat:[].concat(projectRequest),
        dog:[].concat(otherHelpesk),
        dolphin: [].concat(projectRequest, otherHelpesk)
      };

  return {
    appID:  'https://github.com/zendesk/widgets/tree/master/ConditionalFieldsApp',
    defaultState: 'loading',
    type2thing: '',

    events: {
      'app.activated': 'setValue',
      'ticket.custom_field_21631456.changed': 'typeII'
    }, //end events

    typeII: function(){
      var firstField = this.getFieldValue(this.ticket().customField('custom_field_21631456'));
      var secondField = this.getFieldValue(this.ticket().customField('custom_field_21613267'));
      var thirdField = this.getFieldValue(this.ticket().customField('custom_field_280865'));
      var checkedFields = [firstField, secondField, thirdField];
      var notNull = _.all(checkedFields, function (value) {
         console.log(value);
         return value;
         });      
      if (notNull) {
        this.enableSave();
        console.log('it worked');
      } else {
        this.disableSave();
        console.log('sad face');
      }
    },

    setValue: function() {
      //console.log('activated', arguments);
      this.typeII();
    },
    getFieldValue: function (fieldValue) { 
       var thereAreNulls = [undefined, null, '', 'no'];
        if(_.indexOf(thereAreNulls, fieldValue) === -1) {
          return fieldValue;
        } else {
          return '';
        }
      },
    hide: function(fields){
      fields.forEach(function(field) {
        this.ticketFields('custom_field_' + field).hide();
      }, this);
    },

    show: function(fields) {
      fields.forEach(function(field) {
        this.ticketFields('custom_field_' + field).show();
      }, this);
    }
  };
}());
