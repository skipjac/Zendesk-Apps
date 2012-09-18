(function(){
 
  return {
    appID:  'this could be anything',
    defaultState: 'loading',
    events: {
      'app.activated': 'example'
    }, //end events

    example: function(){
      this.switchTo('links',{});
    }
  };
}());
