(function(){

  return {
    appID:  'https://github.com/skipjac/Zendesk-Apps/tree/master/RequiredFieldsApp',
    defaultState: 'loading',

    events: {
      'app.activated': 'toggleSave',
      'ticket.custom_field_21631456.changed': 'toggleSave',
      'ticket.custom_field_21613267.changed': 'toggleSave',
      'ticket.custom_field_280865.changed': 'toggleSave'
    }, //end events

    toggleSave: function(){
      var firstField = this.getFieldValue(this.ticket().customField('custom_field_21631456'));
      var secondField = this.getFieldValue(this.ticket().customField('custom_field_21613267'));
      var thirdField = this.getFieldValue(this.ticket().customField('custom_field_280865'));
      var checkedFields = [firstField, secondField, thirdField];
      var notNull = _.all(checkedFields, function (value) {
         return value;
         });
      if (notNull) {
        this.enableSave();
      } else {
        services.notify(this.I18n.t('fields.more'), 'error');
        this.disableSave();
      }
    },

    getFieldValue: function (fieldValue) {
       var thereAreNulls = [undefined, null, '', 'no'];
        if(_.indexOf(thereAreNulls, fieldValue) === -1) {
          return fieldValue;
        } else {
          return '';
        }
      }
  }; //end of first return
}());
