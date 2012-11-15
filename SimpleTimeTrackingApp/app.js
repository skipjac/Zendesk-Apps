(function(){
  var displayTime = function() {
    return this.settings.totaltime;
  };
  var displayHistory = function() {
    return this.settings.timehistory;
  };
  return {
    appID:  'simple time tracking',
    defaultState: 'loading',
    loadedValue: '',
    loadedHistory: '',
    timeRegex: '',
    realRegex: '',
    events: {
      'app.activated': 'isLoaded',
      'ticket.requester.email.changed': 'haveRequester',
      'getTicketField.done': 'setTicketParam',
      'keyup input#add_time': 'addTime',
      'keyup input#add_date': 'addTime',
      'focusout input#add_date': 'addTime'
    }, //end events
    //REQUESTS 
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
    isLoaded: function(){
      var timeField = displayTime.call(this);
      var historyField = displayHistory.call(this);
      this.haveRequester();
      this.ticketFields('custom_field_' + timeField +'').disable();
      this.ticketFields('custom_field_' + historyField +'').disable();
      this.ajax('getTicketField', timeField);
    },
    haveRequester: function() {
      var timeField = displayTime.call(this);
      var historyField = displayHistory.call(this);
      var requesterEmail = this.ticket().id() && this.ticket().requester().email();
      console.log(requesterEmail);
      if ( requesterEmail === null || requesterEmail === undefined) { return; }
      this.disableSave();
      this.loadedValue = this.ticket().customField('custom_field_' + timeField +'');
      this.loadedHistory = this.ticket().customField('custom_field_' + historyField +'') || '';
      this.switchTo('form', {
        validation: this.timeRegex
      });
    },
    addTime: function() {
      var timeField = displayTime.call(this);
      var historyField = displayHistory.call(this);
      var re = this.realRegex;
      var dateRegex = /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;
      var isValidTime = re.test(this.$('#add_time').val());
      var hasTime = dateRegex.test(this.$('#add_date').val());
      if (_.all([isValidTime, hasTime], _.identity)) {
        var newTime = this.timeAcc(this.loadedValue, this.$('#add_time').val());
        var newHistory = this.loadedHistory + '\n' +  this.currentUser().name() + ',' + this.$('#add_time').val() + ',' + this.$('#add_date').val() + '';
        this.ticket().customField('custom_field_' + timeField +'', newTime);
        this.ticket().customField('custom_field_' + historyField +'', newHistory);
        this.enableSave();
      } else {
        this.ticket().customField('custom_field_' + timeField +'', this.loadedValue);
        this.ticket().customField('custom_field_' + historyField +'', this.loadedHistory);
        this.disableSave();
      }
    },
    setTicketParam: function(data) {
      this.realRegex = new RegExp(data.ticket_field.regexp_for_validation);
      this.timeRegex = data.ticket_field.regexp_for_validation;
      this.haveRequester();
    },
    pad: function(minutes) {
      var whole;
      if (Number(minutes) < 10) {
        whole = '0' + minutes;
      } else {
        whole = minutes; 
      }
      return whole;
    },
    timeAcc: function(currentTotal, additional) {
      var re = /\.|:/;
      var accTime, addTime, total, currentString, additionalString;
      if ( typeof currentTotal !== 'string') {
         currentString = '00:00';
      } else {
        currentString = currentTotal.split(re);
      }
      accTime = Math.floor(Number(currentString[0]) * 60) + Number(currentString[1]);
      if ( typeof additional !== 'string') {
        additionalString = '00:00';
      } else {
        additionalString = additional.split(re);
      }
      addTime = Math.floor(Number(additionalString[0]) * 60) + Number(additionalString[1]);
      total = accTime + addTime; 
      return Math.floor(total / 60) + ':' + this.pad(Math.floor(total % 60));
    }
  };
}());
