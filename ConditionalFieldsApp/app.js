(function(){
  var fieldGroupOne = [ 'custom_field_280865' ],
      fieldGroupTwo = [ 'custom_field_279466' ],

      allFieldsToToggle = [].concat( fieldGroupOne, fieldGroupTwo ),

      fieldMap = {
        cat:     [].concat( fieldGroupOne ),
        dog:     [].concat( fieldGroupTwo ),
        dolphin: [].concat( fieldGroupOne, fieldGroupTwo )
      };

  return {
    appID:  'https://github.com/zendesk/widgets/tree/master/ConditionalFieldsApp',

    defaultState: 'loading',

    events: {
      'app.activated':                        'toggleFields',
      'ticket.custom_field_21631456.changed': 'toggleFields'
    },

    toggleFields: function(){
      this.hide(allFieldsToToggle);
      var conditionValue = this.ticket().customField('custom_field_21631456');
      if ( conditionValue == null ) { return; }
      var fieldsToShow = allFieldsToToggle[ conditionValue ];
      if (fieldsToShow == null) { return; }
      this.show(fieldsToShow);
    },

    hide: function(fields){
      fields.forEach(function(field) {
        this.ticketFields(field).hide();
      }, this);
    },

    show: function(fields) {
      fields.forEach(function(field) {
        this.ticketFields(field).show();
      }, this);
    }
  };
}());
