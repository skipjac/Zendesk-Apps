(function() {

  return {
    formFields: {},
    events: {
      'app.activated':'getSettings',
      'getTicketForms.done': 'buildFormArr',
      'ticket.save': 'checkValue'
    },
    requests:{
      getTicketForms: function() {
        return {
          url: '/api/v2/ticket_forms.json',
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      }
    },
    getSettings: function() {
      var stringOfFields = this.setting('fieldIDs');
      this.arrayOfields = stringOfFields.split(',');
      this.arrayOfields.forEach(function(x, key){
        this.arrayOfields[key] = parseInt(x, 10);
      }, this);
      this.ajax('getTicketForms');
    },
    concatFieldsSting: function(arr){
      var arrayFields = arr;
      arrayFields.forEach(function(x, key){
        arrayFields[key] = 'custom_field_' + x;
      }, this);
      return arrayFields;
    },
    buildFormArr: function(data){
      data.ticket_forms.forEach(function(x){
        this.formFields[x.id] = x.ticket_field_ids;
      }, this);
    },
    checkValue: function(){
      var valid = true;
      var badFieldsstring = '';
      var fieldsInForm = _.intersection(this.arrayOfields, this.formFields[this.ticket().form().id()]);
      if (fieldsInForm.length === 0 ) return true;
      var fixedArray = this.concatFieldsSting(fieldsInForm);
      fixedArray.forEach(function(x){
        var thereAreNulls = [undefined, null, '', '-'];
        if(_.indexOf(thereAreNulls, this.ticket().customField(x)) !== -1){
          valid = false;
          badFieldsstring += this.ticketFields(x).label() + '</br>';
        }
      }, this);
      if(!valid){
        return "Unable to submit ticket because the following fields are missing values </br>" + badFieldsstring;
      }
      return true;
    }
  };

}());
