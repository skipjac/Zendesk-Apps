(function(){
 
  return {
    appID:  'pull second comment',
    defaultState: 'loading',
    events: {
      'app.activated': 'ticketAudit',
      'getTicketAudit.done': 'secondComment',
      'ticket.custom_field_20541671.changed': 'ticketAudit'
    }, //end events
     requests: {
       getTicketAudit: function(id) {
         return {
           url: '/api/v2/tickets/' + id + '/audits.json',
            dataType: 'JSON',
            type: 'GET',
            contentType: 'application/json'
         };
       }
     },
    ticketAudit: function(){
      var ticketID = this.ticket() && this.ticket().id();
      if ( ticketID === null ) { return; }
      var spokeEmail = this.ticket().customField("custom_field_20541671");
      if ( spokeEmail === null) {
       this.ajax('getTicketAudit', ticketID); 
      }
    },
    secondComment: function(data) {
      var audit = data.audits;
      if (audit.length > 1) {
        audit.forEach(function(obj) {
          obj.events.forEach(function(eventObj) {
            if (eventObj.type === "Comment"){
              if (eventObj.body.substr(0,4) === 'xkcd') {
                var strings = eventObj.body.split(' ');
                strings.forEach(function(stringObj) {
                  var emailRegexStr = /^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$/;
                  if (emailRegexStr.test(stringObj)) {
                    this.ticket().customField("custom_field_20541671", stringObj);
                  }
                }, this);
              }
            }
          }, this);
        }, this);
      }
    }
  };
}());
