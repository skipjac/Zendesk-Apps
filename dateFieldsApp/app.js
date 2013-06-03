(function() {

  return {
    currAttempt : 0,
    MAX_ATTEMPTS : 20,
    properties : [],
    events: {
      'app.activated':'init',
      'requiredProperties.ready': 'processFields',
      'change .hasDatepicker': 'updateTicketFields'
    },
    requests: {
      getTicketField: function(ticketID){
        return {
          url: '/api/v2/ticket_fields/' + ticketID +'.json',
          dataType: 'JSON',
          type: 'GET',
          contentType: 'application/json'
        };
      }
    },
    init: function() {
      this.properties = this.settings.fieldMap.split(',');
      this.requiredProperties = _.map(this.properties, function(value, key){
        return 'custom_field_' + value;
      });
      this.allRequiredPropertiesExist();
    },
    processFields: function() {
      var fieldsJson = [];
      var fieldsSorted = [];
      _.each(this.properties, function(x){
        this.ajax('getTicketField', x).done(function(data){
          fieldsJson.push(data.ticket_field);
          if(fieldsJson.length > 1){
            this.sortJsonArrayByProperty(fieldsJson, 'position');
          }
          this.switchTo('fields', {
            publicComments: fieldsJson
          });
          this.getValue(fieldsJson);
        }, this);
      }, this);
    },
    getValue: function(fields){
      _.each(fields, function(x){
        if(this.settings.hideFields){
          this.ticketFields('custom_field_' + x.id).hide();
        } else {
          this.ticketFields('custom_field_' + x.id).disable();
        }
        var dateTimeString = this.ticket().customField('custom_field_' + x.id);
        if (dateTimeString) {
          dateTimeString = dateTimeString.split(" ");
          this.$('._date[data-date-id="'+ x.id +'"]').val(dateTimeString[0]).datepicker({ dateFormat: "yy/mm/dd" });
        } else {
          this.$('._date[data-date-id="'+ x.id +'"]').val("").datepicker({ dateFormat: "yy/mm/dd" });
        }
      }, this);
    },
    updateTicketFields: function(){
      _.each(this.properties, function(x){
        this.ticket().customField('custom_field_' + x, '' + this.$('._date[data-date-id="'+ x +'"]').val() +'');
      }, this);
    },
    // HELPER FUNCTIONS HELPER FUNCTIONS HELPER FUNCTIONS HELPER FUNCTIONS
    allRequiredPropertiesExist: function() {
      if (this.requiredProperties.length > 0) {
        var valid = this.validateRequiredProperty(this.requiredProperties[0]);
        // prop is valid, remove from array
        if (valid) {
          this.requiredProperties.shift();
        }

        if (this.requiredProperties.length > 0 && this.currAttempt < this.MAX_ATTEMPTS) {
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
        this.services.notify(this.I18n.t('errors.data'));
      }
    },

    safeGetPath: function(propertyPath) {
      return _.inject( propertyPath.split('.'), function(context, segment) {
        if (context == null) { return context; }
        var obj = context[segment];
        if ( _.isFunction(obj) ) { obj = obj.call(context);}
        return obj;
      }, this);
    },
  
    validateRequiredProperty: function(propertyPath) {
      if (propertyPath.match(/custom_field/)) { return !!this.ticketFields(propertyPath); }
      var value = this.safeGetPath(propertyPath);
      return value != null && value !== '' && value !== 'no';
    },
    sortJsonArrayByProperty: function(objArray, prop, direction){
      if (arguments.length<2) throw new Error("sortJsonArrayByProp requires 2 arguments");
      var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
      if (objArray && objArray.constructor===Array){
        var propPath = (prop.constructor===Array) ? prop : prop.split(".");
        objArray.sort(function(a,b){
          for (var p in propPath){
            if (a[propPath[p]] && b[propPath[p]]){
              a = a[propPath[p]];
              b = b[propPath[p]];
            }
          }
          // convert numeric strings to integers
          // a = a.match(/^\d+$/) ? +a : a;
          // b = b.match(/^\d+$/) ? +b : b;
          return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
        });
      }
    }
  };

}());
