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
      this.hide(hideAll);
      this.type2thing = this.ticket().customField('custom_field_21631456');
      //console.log('control field value: ' + this.type2thing);
      if (this.type2thing != null) {
       this.show(moodFieldMap[this.type2thing]);
      }
    },

    setValue: function() {
      //console.log('activated', arguments);
      this.typeII();
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
