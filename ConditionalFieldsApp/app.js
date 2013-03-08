(function(){
  return {
    currAttempt : 0,
    MAX_ATTEMPTS : 20,
    appID:  'https://github.com/zendesk/widgets/tree/master/ConditionalFieldsApp',
    requiredProperties: [],
    allFieldsToToggle: [],
    fieldMap: {},
    events: {
      'app.activated':  'init',
      'requiredProperties.ready': 'toggleFields',
      'ticket.custom_field_21631456.changed': 'toggleFields'
    },
    init: function(){
      //convert the string from the settings in to a javascript object
      this.fieldMap = JSON.parse(this.settings.fieldMap);
      Object.keys(this.fieldMap).forEach(function(key){
        //get the all the field values from the settings object and put into arrays
        this.requiredProperties = this.requiredProperties.concat(this.fieldMap[key]);
        this.allFieldsToToggle = this.allFieldsToToggle.concat(this.fieldMap[key]);
      }, this);
      //call allRequiredPropertiesExist to ensure all the field values in the object exist
      this.allRequiredPropertiesExist();
    },
    toggleFields: function(){
      this.hide(this.allFieldsToToggle);
      var thereAreNulls = [undefined, null, '', '-'];
      var conditionValue = this.ticket().customField('custom_field_21631456');
      if (_.indexOf(thereAreNulls, conditionValue) === -1) {
        this.show(this.fieldMap[conditionValue]);
      } 
    },
    allRequiredPropertiesExist: function() {
      if (this.requiredProperties.length > 0) {
        var valid = this.validateRequiredProperty(this.requiredProperties[0]);
        // prop is valid, remove from array
        if (valid) {
          this.requiredProperties.shift();
        }
        if (this.requiredProperties.length > 0) {
          if (!valid) {
            ++this.currAttempt;
          }
          _.delay(_.bind(this.allRequiredPropertiesExist, this), 100);
          return;
        }
      }
      if (this.currAttempt < this.MAX_ATTEMPTS) {
        this.trigger('requiredProperties.ready');
      } else {
        this.services.notify(this.I18n.t('global.error.data'));
      }
    },
    validateRequiredProperty: function(property) {
      var parts = 'custom_field_' + property;
      var part = '', obj = this;
          obj = this.ticketFields(parts);
        // check if property is invalid
        if (!_.isObject(obj)) {
          return false;
        }
        // check if value returned from property is invalid
        if (parts.length === 0 && (_.isNull(obj) || _.isUndefined(obj) || obj === '' || obj === 'no')) {
          return false;
        }
      //}
      return true;
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