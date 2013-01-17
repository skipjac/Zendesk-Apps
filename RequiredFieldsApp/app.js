(function(){

  function fieldValueIsBlank(value) {
    // "no" is for checkbox fields
    return value == null || value === '' || value === 'no';
  }

  function anyValueIsBlank = function(values) {
    return _.any(values, fieldValueIsBlank);
  }

  return {
    appID:  'https://github.com/skipjac/Zendesk-Apps/tree/master/RequiredFieldsApp',
    defaultState: 'loading',

    events: {
      'app.activated': 'toggleSave',
      'ticket.custom_field_21631456.changed': 'toggleSave',
      'ticket.custom_field_21613267.changed': 'toggleSave',
      'ticket.custom_field_280865.changed': 'toggleSave'
    }, //end events

    checkedFieldValues: function() {
      return [
        this.ticket().customField('custom_field_21631456'),
        this.ticket().customField('custom_field_21613267'),
        this.ticket().customField('custom_field_280865')
      ];
    },

    toggleSave: function(){
      if ( anyValueIsBlank(this.checkedFieldValues()) ) {
        services.notify(this.I18n.t('fields.more'), 'error');
        this.disableSave();
      } else {
        this.enableSave();
      }
    }
  }; //end of first return

}());
