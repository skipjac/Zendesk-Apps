(function(){
 
  return {
    appID:  'FourmApp',
    defaultState: 'loading',
    forums: [],
    events: {
      'app.activated': 'onLoad',
      'getForumID.done': 'processForums',
      'blur input#searchText': 'searchString'
    }, //end events
    requests: {
        getForumID: function() {
          return {
            url: '/api/v2/forums.json',
            dataType: 'JSON',
            type: 'GET',
            contentType: 'application/json'
            };
          },
          getTopicCount: function (id) {
            return {
            url: '/api/v2/forums/' + id + '/topics.json',
            dataType: 'JSON',
            type: 'GET',
            contentType: 'application/json'
          };
        }
      },//end requests

    onLoad: function(){
      if (this.forums.length > 0 ){
        this.displayLinks();
      } else {
         this.ajax('getForumID');
      }
     
    },
    processForums: function(data) {
      var forumList = data.forums;
      this.forums = data.forums;
      this.forums.forEach(function (x) {
        this.ajax('getTopicCount', x.id).done(function(data) {
          x.count = data.count;
          this.displayLinks();
        }, this);
      }, this);
    },
    displayLinks: function () {
      this.switchTo('links', { 
        createResult: this.forums
      });
    },
    searchString: function () {
      var query = this.$('#searchText').val();
      this.forums.forEach(function (x) {
        x.queryString = query;
      });
      this.switchTo('links', { 
        createResult: this.forums,
        queryString: query
      });
    }
  };
}());
