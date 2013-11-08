(function(){
  var buildTicketFormList = function(item) {
    this.ticketForms[item.id] = item.ticket_field_ids;
    // get default ticket form ID as necessary
    if (item['default']) {
      this.defaultTicketFormID = item.id;
    }
  };
  var buildTicketFieldList = function(item) {
    // get default ticket form ID as necessary
    if (item.active) {
      this.ticketFieldList.push(item.id);
    }
    this.ticketForms['1'] = this.ticketFieldList;
    this.defaultTicketFormID = 1;
  };
  return {
    currAttempt : 0,
    MAX_ATTEMPTS : 20,
    appID:  'conditional_fields_app',
    requiredProperties: [],
    allFieldsToToggle: [],
    fieldMap: {},
    settingMap: {},
    watchFields: [],
    ticketData: {},
    ticketForms: {},
    defaultTicketFormID: '',
    currentTicketformID: '',
    ticketFieldList: [],
    selectionval: '',
    events: {
      // Lifecylce 
      'app.activated':  'init',
      'requiredProperties.ready': 'toggleFields',
      'ticket.form.id.changed': 'checkData',
      '*.changed': 'handleDynamicEvents',
      'ticketReady.ready': 'checkData',
      'foundForm.ready': 'setFields',
      // Requests
      'getForms.done': 'processForm',
      'getTicketForms.done': 'processTicketForms',
      'getTicketForms.fail': 'getTicketFieldsData',
      'getTicketFields.done': 'processTicketFields'
    },
    requests:{
      getTicketForms: function() {
        return {
          url: '/api/v2/ticket_forms.json',
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      },
      getTicketFields: function() {
        return {
          url: '/api/v2/ticket_fields.json',
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      }
    },
    handleDynamicEvents: function(data) {
      var propertyName = data.propertyName; // "custom_field_3245"
      var calledField = propertyName.split('.'); // split the propertyName so the value matches the old JSON mapping
      var aWatchedField = (_.contains(this.watchFields, calledField[1])); //is the changed field in the array of watched fields
      if (aWatchedField) {
        this.toggleFields(); //fire toggle if the changed field is in the watched field array
        return;
      }
    },
    init: function(){
      this.getTicketFormData(1);
    },
    getTicketFieldsData: function(page){
      this.ajax('getTicketFields', page);
    },
    getTicketFormData: function(page) {
      this.ajax('getTicketForms', page);
    },
    getProjectData: function() {
      this.currentTicketformID = this.ticket().form().id() || this.defaultTicketFormID;
      this.buildSettings();
    },
    processTicketFields: function(data){
      console.log('ticket field data ', data);
      var nextPage = 1;
      _.each(data.ticket_fields, buildTicketFieldList, this);
      if (data.next_page !== null) {
        nextPage = nextPage + 1;
        this.getTicketFieldsData(nextPage);
      } else {
        this.getProjectData();
      }
    },
    processTicketForms: function(data) {
      var nextPage = 1;
      _.each(data.ticket_forms, buildTicketFormList, this);
      if (data.next_page !== null) {
        nextPage = nextPage + 1;
        this.getTicketFormData(nextPage);
      } else {
        this.getProjectData();
      }
    },
    checkData: function(){
      this.currAttempt = 0;
      this.currentTicketformID = this.ticket().form().id();
      _.defer(this.buildSettings.bind(this));
    },
    buildSettings: function(){
      this.settingMap = JSON.parse(this.settings.fieldMap);
      //convert the string from the settings in to a javascript object
      // future use Object.keys(test).forEach(function(key) { Object.keys(test[key]).forEach(function(innerKey){innerFields[innerKey] = test[key][innerKey];});}, this);
      Object.keys(this.ticketForms).forEach(function(key) {
        //console.log('skip -- key --', key);
        if (parseInt(key, 10) === this.currentTicketformID ) {
          //console.log('skip -- found the key');
          this.newArray = _.map(this.ticketForms[key], function(a) {
                return 'custom_field_' + a;
            });
        }
      }, this);
        for ( var key in this.settingMap) {
            if(!_.contains(this.newArray, key)){
                delete this.settingMap[key];
            }
            this.setFields();
        }
    },
    setFields: function(){
       this.watchFields = [];
      Object.keys(this.settingMap).forEach(function(key){
          this.watchFields.push(key);
        //get the all the field values from the settings object and put into arrays
        Object.keys(this.settingMap[key]).forEach(
          function(innerKey){
            this.fieldMap[innerKey] = this.settingMap[key][innerKey];
            this.requiredProperties = this.requiredProperties.concat(this.fieldMap[innerKey]);
          }, this);
      }, this);
      this.allFieldsToToggle = _.intersection(this.newArray, this.requiredProperties);
      this.trigger('requiredProperties.ready');
    },
    toggleFields: function(){
      var thereAreNulls = [undefined, null, '', '-'];
      var count = 0;
      var fieldsToShow = [];
      this.watchFields.forEach(function(watchedID){
        this.selectionval = this.ticket().customField(watchedID);
        count = count + 1;
        if (_.indexOf(thereAreNulls, this.selectionval) === -1) {
          var fields = _.intersection(this.newArray, this.fieldMap[this.selectionval]);
          fieldsToShow = _.union(fieldsToShow, fields);
        }
        if( count === this.watchFields.length ) {
          this.show(fieldsToShow);
          this.clearField(this.allFieldsToToggle, fieldsToShow);
        }
      }, this);
    },
    // HELPER FUNCTIONS HELPER FUNCTIONS HELPER FUNCTIONS HELPER FUNCTIONS HELPER FUNCTIONS HELPER FUNCTIONS
    allRequiredPropertiesExist: function(ready) {
      if (this.requiredProperties.length > 0) {
        var valid = this.validateRequiredProperty(this.requiredProperties[0]);
        // prop is valid, remove from array
        if (valid) {
          this.requiredProperties.shift();
        }
        if (this.requiredProperties.length > 0 && this.currAttempt < this.MAX_ATTEMPTS) {
          if (!valid) {
            ++this.currAttempt;       
          _.delay(_.bind(this.allRequiredPropertiesExist(ready), this), 100);
          return;
          }
        }
      }
      if (this.currAttempt < this.MAX_ATTEMPTS) {
        this.trigger(ready);
      } else {
        services.notify(this.I18n.t('global.error.data'), 'error');
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
    hide: function(fields){
      //console.log('hide these fields', fields);
      fields.forEach(function(field) {
        this.ticketFields(field).hide();
      }, this);
    },

    show: function(fields) {
      console.log('show these fields', fields);
      fields.forEach(function(field) {
        this.ticketFields(field).show();
      }, this);
    },
    clearField: function(fields, showingFields) {
        fields.forEach(function(field){
           if (!showingFields.contains(field)) {
             this.ticket().customField(field, null);
             this.ticketFields(field).hide();
           }
         }, this);
      }
  };
}());