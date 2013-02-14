(function(){
  return {
    appID: 'createTicketApp',
    defaultState: 'layout',
    name: '',
    groups: [],
    targetSpoke: this.$('#zendeskSelect').val() || '',
    newRequester: this.$('#userName').val() || '',
    newEmail: this.$('#userEmail').val() || '',
    newSub: this.$('#userSub').val() || '',
    newDesc: this.$('#ticketDesc').val() || '',
    events: {
      'click .submitSpoke': 'createTicketValues',
      'createTicket.done': 'processData',
      'click .displayForm': 'switchToReqester'
    }, //end events
    requests: {
      createTicket: function() {
        return {
          url: 'http://' + this.targetSpoke + '/requests/embedded/create.json?subject=' + this.newSub + '&description='+ this.newDesc + '&name=' + this.newRequester  + '&email='+ encodeURI(this.newEmail) + '',
          dataType: 'JSON'
        };
      }
    }, //end requests
    processData: function(data, response, responseText) {
      console.log(responseText);
      this.switchTo('description', {
        newTicket: data.message,
        spoke: this.targetSpoke
      });
    },
    createTicketValues: function() {
      this.targetSpoke = this.$('#zendeskSelect').val();
      this.newRequester = this.$('#userName').val();
      this.newEmail = this.$('#userEmail').val();
      this.newSub = this.$('#userSub').val();
      this.newDesc = this.$('#ticketDesc').val();
      this.ajax('createTicket');
    },
    switchToReqester: function(data) {
      this.switchTo('requester', {});
    }
  };//end first return
}());
