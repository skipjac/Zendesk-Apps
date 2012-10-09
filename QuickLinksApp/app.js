(function(){
 
  return {
    appID:  'Quick Links',
    defaultState: 'loading',
    events: {
      'app.activated': 'links',
      'ticket.custom_field_21594582.changed': 'links',
      'ticket.custom_field_21745801.changed': 'links',
      'ticket.requester.email.changed': 'links'
    }, //end events

    links: function(){
      var ticketID = this.ticket() && this.ticket().id();
      if ( ticketID == null ) { return; }
      var requesterEmail = this.ticket().requester() && this.ticket().requester().email();
      if ( requesterEmail == null ) { return; }
      var thereAreNulls = [undefined, null, ''];
      var casperID = this.ticket().customField('custom_field_21594582');
      var geoIP = this.ticket().customField('custom_field_21745801');

        this.switchTo('links',{
          searchCasper: casperID,
          requestEmail: requesterEmail,
          ip: geoIP,
          ticketid: ticketID
        });  
    }
  };
}());
