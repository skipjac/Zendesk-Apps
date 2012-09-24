(function(){
  //helper function to build new objects from returned JSON requests, thank you James
  //you pass in the object you want to use the function you will use and the context which is usally this
  function objectIteration(obj, fn, context) {
    Object.keys(obj).forEach(function(key) {
      fn.call(context, key, obj[key]);
    });
  }
  //build a group object for looking up a group name from id
  var buildGroupList = function(data, item){ 
    this.groups[item.id] = item.name;
    //build an array for the ticket submit pages to create dropdown list
    this.groupDrop.push({'id': '' + item.id + '', 'name': ''+ item.name +''});
  };
  //build a agent object for looking up a agent name from id
  var buildAgentList = function(data, item){
    this.assignees[item.id] = item.name;
  };
  //build a list of tickets in the project
  var buildTicketList = function(data, item) {
    if (_.indexOf(item.tags, 'project_child') !== -1){
      if ((this.isSolvable === true) && !(_.include(this.whatIsSolved, item.status))) {
        this.isSolvable = false;
      }
      this.ticketList.push({'id': '' + item.id + '', 'status': '' + item.status + '', 'type': '' + item.type + '', 'assignee_id' : '' + this.assigneeName(item.assignee_id) + '', 'group_id': '' + this.groupName(item.group_id) + '','selected': false});
    } else {
      this.ticketList.push({'id': '' + item.id + '', 'status': '' + item.status + '', 'type': '' + item.type + '', 'assignee_id' : '' + this.assigneeName(item.assignee_id) + '', 'group_id': '' + this.groupName(item.group_id) + '','selected': true});
    }    
  };
  var displayProjectName = function() {
    return this.settings.Custom_Field_ID;
  };
    return {
    appID:  'https://github.com/zendesk/widgets/tree/master/ProjectApp',
    defaultState: 'list',
    name: '',
    groups: {},
		assignees: {},
		groupDrop: [],
    ticketList: [],
    createResultsData: [],
    isSolvable : true,
    whatIsSolved: ['closed','solved'],
    events: {
    'app.activated': 'getProjectData',
    'getExternalID.done': 'findProjects',
    'searchExternalID.done': function(data) {
       this.listProjects(data || {});
      },
    'click .submitSpoke': 'createTicketValues',
    'click .submitBulk': 'createBulkTickets',
    'createTicket.done': 'processData',
    'click .displayForm': 'switchToReqester',
		'click .displayList': 'updateList',
    'click .displayMultiCreate': 'switchToBulk',
    'getGroups.done': 'processGroups',
		'getAgents.done': 'processAgents',
    'click .displayUpdate': 'switchToUpdate',
    'click .updateticket': 'updateTickets',
    'click .removeTicket': 'removeFrom',
    'ticket.status.changed': function() {
      //console.log(this.isSolvable);
    }
  }, //end events
  requests: {
    createTicket: function(childCall) {
      return {
        url: '/api/v2/tickets.json',
        dataType: 'JSON',
        type: 'POST',
        contentType: 'application/json',
        data: childCall
        };
      },
      getGroups : function(page){
        return {
          url: '/api/v2/groups.json?page=' + page,
          dataType: 'JSON',
          type: 'GET'
        };
      },
      putExternalID: function(data, id) {
        return {
          url: '/api/v2/tickets/' + id +'.json',
          dataType: 'JSON',
          type: 'PUT',
          contentType: 'application/json',
          data: data
        };
      },
      getExternalID: function(ticket) {
        return {
          url: '/api/v2/tickets/' + ticket +'.json',
          dataType: 'JSON',
          type: 'GET',
          contentType: 'application/json'
        };
      },
      searchExternalID: function(data, page) {
        return {
          url: '/api/v2/search.json?page=' + page + '&per_page=50&query=type:ticket+external_id:'+ data,
          dataType: 'JSON',
          type: 'GET',
          contentType: 'application/json'
        };
      },
			getAgents: function(page) {
				return {
          url: '/api/v2/users.json?page=' + page + '&role%5B%5D=4&role%5B%5D=2',
          dataType: 'JSON',
          type: 'GET'
				};
			}
    }, //end requests
  processData: function(data, response, responseText) {
    this.ticket().tags().add(['project_parent', 'project_'+this.ticket().id()]);
    this.ticket().customField('custom_field_' + displayProjectName.call(this) +'', 'Project-' + this.ticket().id());
    this.createResultsData.push({'id': '' + data.ticket.id + '', 'external_id': '' + data.ticket.external_id + ''});
    this.switchTo('description', {
      createResult: this.createResultsData
    }); 
  },
  createTicketValues: function() {
    var ticket = this.ticket();
    var groupSelected = [];
    this.createResultsData = [];
    if (Array.isArray(this.$('#zendeskSelect').val())) {
      groupSelected = this.$('#zendeskSelect').val();
    } else {
      groupSelected.push(this.$('#zendeskSelect').val());
    }
    groupSelected.forEach(function (group) {
      var rootTicket = {};
          rootTicket.ticket = {};
          rootTicket.ticket.subject = this.$('#userSub').val() + ' child ticket of ' + ticket.id();
          rootTicket.ticket.comment = {};
          rootTicket.ticket.comment.value = this.$('#ticketDesc').val();
          rootTicket.ticket.requester = {};
          rootTicket.ticket.requester.name = this.$('#userName').val();
          rootTicket.ticket.requester.email = this.$('#userEmail').val();
          rootTicket.ticket.group_id = group;
          rootTicket.ticket.external_id = 'Project-' + ticket.id();
          rootTicket.ticket.tags = ['project_child', 'project_'+ ticket.id()];
          rootTicket.ticket.fields = {};
          rootTicket.ticket.fields[ displayProjectName.call(this) ] = 'Project-' + ticket.id();
          var childCall = JSON.stringify(rootTicket);
          this.ajax('createTicket', childCall);
        }, this);
        //for the future
        //ticket.external_id('Project-' + ticket.id());
    var currentTags = this.ticket().tags();
    this.putTicketData(currentTags, 'project_parent', 'add', ticket.id());
    
  },
  switchToReqester: function() {
    this.switchTo('requester', {
      name: this.currentUser().name(),
      email:  this.currentUser().email(),
			groups: this.groupDrop,
      subject: this.ticket().subject() + ' child ticket of ' + this.ticket().id(),
      desc:  this.ticket().description()
    });
  },
  getProjectData: function(data) {
    if (data.firstLoad) {
      //get all the groups   
      this.getGroupsData(1);
      //get all the agents in the system V2 API
      this.getAgentData(1);
    }
    //get the exteranl API on the currently viewed ticket
    this.ajax('getExternalID', this.ticket().id());
    //get the value of the Project ticket field
    var projectField = displayProjectName.call(this);
    //build array of all possible types of empty return values
    var thereAreNulls = [undefined, null, ''];
    //check to see if the field is there, if it’s there is it empty. 
    var isNotEmpty = (_.indexOf(thereAreNulls, this.ticket().customField('custom_field_' + projectField +'')) === -1);
    if (isNotEmpty){
      //if the field contains a value disable editing of the field
      this.ticketFields('custom_field_' + projectField +'').disable();
    } else {
      //if it’s not returned or empty hide the field
      this.ticketFields('custom_field_' + projectField +'').hide();
    }
  }, 
  findProjects: function(data){
    if (data.ticket.external_id !== "") {
      this.getProjectSearch(data.ticket.external_id, 1);
    } else {
      var broken = {};
      broken.results = {};
      this.listProjects(broken);
    }
  },
  getProjectSearch: function (externalID, page) {
    this.ajax('searchExternalID', externalID, page);
  },
  listProjects: function(data){
		this.ticketList = [];
    var nextPage = 1;
    objectIteration(data.results, buildTicketList, this);
    if (data.next_page !== null){
      nextPage = nextPage + 1;
      this.getProjectSearch(data.results.external_id, nextPage);
    }
    this.switchTo('list', {
      projects: this.ticketList
    });
    //hide the remove button in the template if not child ticket
    this.$('button.removeTicket').hide();
    //if the current ticket is a child hide the create buttons in the template and show the remove
    if (_.indexOf(this.ticket().tags(), 'project_child') !== -1) {
      this.$('button.displayForm').hide();
      this.$('button.displayMultiCreate').hide();
      this.$('button.displayUpdate').hide();
      this.$('button.removeTicket').show();
    }
  },
  getGroupsData: function(page){
    if ( page === 1 && Object.keys(this.groups).length > 0 ) { return; }
    this.ajax('getGroups', page);
  },
  processGroups: function(data) {
    var nextPage = 1;
    objectIteration(data.groups, buildGroupList, this);
    if (data.next_page !== null){
      nextPage = nextPage + 1;
      this.getGroupsData(nextPage);
    }
  },
  getAgentData: function(page){
     if ( page === 1 && Object.keys(this.assignees).length > 0 ) { return; }
     this.ajax('getAgents', page);
  },
	processAgents: function(data) {
    var nextPage = 1;
    objectIteration(data.users, buildAgentList, this);
    if (data.next_page !== null){
      nextPage = nextPage + 1;
      this.getAgentData(nextPage);
    }
	},
	updateList: function() {
    this.ajax('getExternalID', this.ticket().id());
	},
	groupName: function(groupID) {
		if (groupID === null) { return 'None'; }
		return this.groups[groupID] || 'None';
	},
	assigneeName: function(assigneeID) {
		if (assigneeID === null) { return 'None'; }
		return this.assignees[assigneeID] || 'None';
	},
  switchToBulk: function() {
    this.switchTo('multicreate', {
      name: this.currentUser().name(),
      email:  this.currentUser().email(),
			groups: this.groupDrop,
      subject: this.ticket().subject() + ' child ticket of ' + this.ticket().id(),
      desc:  this.ticket().description()
    });
  },
  createBulkTickets: function (){
    this.createTicketValues();
  },
  switchToUpdate: function() {
    this.switchTo('updatetickets',{
      
    });
  },
  updateTickets: function() {
    var re = /,|\s/;
    var list = this.$('#listofIDs').val().split(re);
    //update the the current ticket 
    var currentTags = this.ticket().tags();
    this.putTicketData(currentTags, 'project_parent', 'add', this.ticket().id());
    //get the list supplied and update the ticket.
    list.forEach( function(ticket){
      this.ajax('getExternalID', ticket)
      .done(function(data){
        if ((data.ticket.status !== 'closed') && (_.indexOf(data.ticket.tags, 'project_child') === -1)) {
          this.putTicketData(data.ticket.tags, 'project_child', 'add', data);
        } else if (data.ticket.status === 'closed') {
          services.notify(data.ticket.id +' is closed', 'error');
        } else if (_.indexOf(data.ticket.tags, 'project_child') !== -1) {
          services.notify(data.ticket.id +' is member of another project ' + data.ticket.external_id + ' ', 'error');
        }
      });
    }, this);
  },
  removeFrom: function () {
    this.ajax('getExternalID', this.ticket().id())
    .done(function (data) {
      this.putTicketData(data.ticket.tags, 'project_child', 'remove', data);
      var projectTag = data.ticket.external_id.replace(/-/i, '_').toLowerCase();
      this.ticket().tags().remove(['project_child', projectTag]);
      this.ticket().customField('custom_field_' + displayProjectName.call(this) +'', '');
    });
  },
  putTicketData: function (tags, linking, type, data) {
    var ticketTags = tags;
    var isParent = (_.indexOf(ticketTags, 'project_parent') !== -1);
    var ticketUpdateID;
    var updateTicket = {};
    if (_.isObject(data)) {
      ticketUpdateID = data.ticket.id;
    } else {
      ticketUpdateID =  data;
    } 
    updateTicket.ticket = {};
    updateTicket.ticket.fields = {};
    if (!isParent && type === 'add') {
      ticketTags.push(linking, 'project_'+ this.ticket().id());
      updateTicket.ticket.fields[ displayProjectName.call(this) ] = 'Project-' + this.ticket().id(); 
      updateTicket.ticket.external_id = 'Project-' + this.ticket().id();
    } else if (!isParent && type === 'remove') {
      var projectTag = data.ticket.external_id.replace(/-/i, '_').toLowerCase();
      ticketTags.splice(_.indexOf(tags, "project_child"),1);
      ticketTags.splice(_.indexOf(tags, projectTag),1);
      updateTicket.ticket.fields[ displayProjectName.call(this) ] = ''; 
      updateTicket.ticket.external_id = '';
    } else {
      ticketTags.push(linking, 'project_'+ this.ticket().id());
      updateTicket.ticket.fields[ displayProjectName.call(this) ] = 'Project-' + this.ticket().id(); 
      updateTicket.ticket.external_id = 'Project-' + this.ticket().id();
    }        
    updateTicket.ticket.tags = ticketTags;
    var thisTicket = JSON.stringify(updateTicket);
    if (!isParent) {
       this.ajax('putExternalID', thisTicket, ticketUpdateID);
    }
   
  }
}; //end first return
}());

