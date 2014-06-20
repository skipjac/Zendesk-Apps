// ************************* Conditional Fields ***********************************
 $(document).ready(function() {

  //console.log('in cond fields');
    //use the same object is used in the conditional fields app for the new Zendesk agent interface
    var setting = '{"custom_field_21631456": {"cat":["custom_field_21875871","custom_field_21865183","custom_field_21745801"], "dog":["custom_field_22103126","custom_field_21613267"], "dolphin": ["custom_field_280865", "custom_field_20295661"], "the_fish": ["custom_field_279466"]}, "custom_field_279466":{"asdf":["custom_field_21651413"], "xfer_to_a": [], "fire_to_new_page": []}}';
    var settingMap = JSON.parse(setting);
    var watchFields = [];
    var requiredProperties = [];
    var fieldMap = [];
    var newArray = [];
    var allFieldsToToggle = [];
    //this gets the fields that are on the current request page 
    var availFields = $('.form-field [name]').map(function() {
      return this.name;
    });
    //show fields
    var show = function() {
        $.each(arguments, function(i, item) {
          _.each(item, function(i) {
            $('[name="' + i + '"]').parents('.form-field').css('display', '').addClass('required').removeClass('optional');
          });
        });
      };
    //hide fields
    var hide = function(hide, show) {
        hide.forEach(function(field) {
          if (!_.contains(show, field)) {
            clearValue(field);
            $('[name="' + field + '"]').parents('.form-field').css('display', 'none').removeClass('required');
          }
        }, this);
      };
    //clear the fields that are hidden
    var clearValue = function(field) {
        $('input[name="' + field + '"]').filter('[value=]').prop('checked', true);
        if ($('[name="' + field + '"]').parent().hasClass('text')) {
          
          $('[name="' + field + '"]').val('');
        }
        $('[name="' + field + '"]').parents('.nesty').children('.nesty-input').map(function(x, y) {
          $(y).text('');
        });
      };
    //convert the settingMap to match the Help Center DOM
    var convertField = function(field) {
        var newName;
        if (_.isObject(field)) {
          newName = [];
          field.forEach(function(x) {
            var e = x.split('_');
            newName.push('request[custom_fields][' + e[e.length - 1] + ']');
          });
        } else if (_.isString(field)) {
          var e = field.split('_');
          newName = 'request[custom_fields][' + e[e.length - 1] + ']';
        }
        return newName;
      };
    //build the all fields toggle for the current page. 
    var setFields = function() {
        Object.keys(settingMap).forEach(function(key) {
          watchFields.push(convertField(key));

          //get the all the field values from the settings object and put into arrays
          Object.keys(settingMap[key]).forEach(

          function(innerKey) {
            fieldMap[innerKey] = convertField(settingMap[key][innerKey]);
            //fieldMap[innerKey] = settingMap[key][innerKey]
            requiredProperties = requiredProperties.concat(fieldMap[innerKey]);
          }, this);
        }, this);
        allFieldsToToggle = _.intersection(availFields, requiredProperties);
        toggleFields(allFieldsToToggle);
      };
    //call the show and hide based on the watched fields selected values
    var toggleFields = function(allFieldsToToggle){
      var thereAreNulls = [undefined, null, '', '-'];
      var count = 0;
      var fieldsTo = [];
      var fieldsToShow = [];
      //build the show fields object
      watchFields.forEach(function(watchedID){
        var selectionval = $('input[name="' + watchedID + '"]').val();
        count = count + 1;
        if (_.indexOf(thereAreNulls, selectionval) === -1) {
          var fields = _.intersection(availFields, fieldMap[selectionval]);
          fieldsToShow = _.union(fieldsToShow, fields);
        }
        if( count === watchFields.length ) {
          var somethingUsful = _.intersection(allFieldsToToggle, watchFields);
          //remove any fields that are that are in a hidden watched field
          somethingUsful.forEach(function(x){
            if(!_.contains(fieldsToShow, x)){
              var y = $('input[name="' + x + '"]').val();
              fieldsToShow = _.difference(fieldsToShow, fieldMap[y]);
            }
          });
          show(fieldsToShow);
          hide(allFieldsToToggle, fieldsToShow);
        }
      }, this);
    };
    //call set fields on page load
    setFields();
    // watch the fields for changes
    $('input').change(function(e){

      if(_.contains(watchFields, e.target.name)){
        toggleFields(allFieldsToToggle);
      }
    });
  });
  
  //********************************  END Conditional Fields  ***********************************


  
