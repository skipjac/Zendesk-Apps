(function () {
	'use strict';
  return {
    appID:  'this could be anything',
    defaultState: 'loading',
    events: {
        'app.activated': 'userID',
        'ticket.requester.email.changed': 'userID',
        'getOrgData.done': 'orgDataProcess'
    }, //end events
    requests: {
        getOrgData: function (id) {
            return {
                url: '/api/v2/users/' + id + '.json?include=organizations',
                dataType: 'JSON',
                type: 'GET',
                contentType: 'application/json'
            };
        },
        getOrgTicketCount: function (dataLoad) {
            return {
                url: '/api/v2/views/preview.json',
                dataType: 'JSON',
                type: 'POST',
                data: dataLoad,
                contentType: 'application/json'
            };
        }
    },

    userID: function () {
        var requesterEmail = this.ticket().requester() && this.ticket().requester().email();
        if ( requesterEmail === null ) { return; }
        this.ajax('getOrgData', this.ticket().requester().id());
    },
    orgDataProcess: function (data) {
        var orgData = data.organizations;
        var openTickets, solvedTickets;
        if ( orgData.length > 0 ) {
            orgData.forEach( function (x) {
              var orgSolvedTickets = '{"view":{"all":[{"field":"organization","operator":"is","value":' + x.id +'}],"any":[{ "operator": "greater_than", "value": "open", "field": "status" }],"output":{"columns":["id"],"sort_by":"updated_at"}}}';
              var orgOpenTickets = '{"view":{"all":[{"field":"organization","operator":"is","value":' + x.id +'}],"any":[{ "operator": "less_than", "value": "solved", "field": "status" }],"output":{"columns":["id"],"sort_by":"updated_at"}}}';
                this.ajax('getOrgTicketCount', orgOpenTickets).done( function(data) {
                    openTickets = data.count;
                    this.ajax('getOrgTicketCount', orgSolvedTickets).done( function(data) {
                        solvedTickets = data.count;
                        this.displayReuslts(x, openTickets, solvedTickets);
                    }, this);
                }, this);
         }, this);
        } else {
            this.switchTo('noOrg', {});
        }
    },
    displayReuslts: function (x, openCount, solveCount) {
        this.switchTo('withorg', {
            orgName: x.name,
            orgDomain: x.domain_names,
            orgDetails: x.details,
            orgNotes: x.notes,
            orgTags: x.tags,
            orgOpen: openCount,
            orgSolved: solveCount
            });
        }
  };
}());
