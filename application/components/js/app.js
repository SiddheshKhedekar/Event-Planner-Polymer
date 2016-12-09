/*=========================================================================== 

This document contains the main javascript for the event planner application

============================================================================*/

/*=========================================================================== 

MVC start

============================================================================*/

/*=========================================================================== 

  Model

  ============================================================================*/

  // most data is held externally in firebase and within the polymer dom files
  
  Model = {};

  /*=========================================================================== 

  View

  ============================================================================*/
    // selects view elements
  
  View = {

    rButton : document.getElementById("registerButton"),
    lButton : document.getElementById("loginButton")
  
  };    

    /* 
    
    old elements being migrated into the view object
    logic button elements
    var rButton = document.getElementById("registerButton");
    var lButton = document.getElementById("loginButton");
    var lFormButton = document.getElementById("signInPw");
    var lFormRegButton = document.getElementById("accountReg");
    var pInfo = document.querySelector('#personalInfo');

    // container elements
    var loginContainer = document.querySelector('#logIn');
    var regContainer = document.querySelector('#registrationForm');
    var pInfoContainer = document.querySelector('#personalInfoContainer');

    //sets up login progress bar selector 
    var progressBar = document.querySelector('paper-progress');

    // selectors for activation elements
    var loginProgressBar = document.querySelector('#progressLogin');
    var regProgressBar = document.querySelector('#progress-reg');
    var regProgressBarOpt = document.querySelector('#progress-reg-optional');
    var eventLogin = document.querySelector('event-login-pw');

    // login form inputs
    var inputs = [
      {
        selector: '#loginEmail',
        amount: 50
      }, {
        selector: '#loginPassword',
        amount: 50
      }
    ];

    // registration form inputs
    var inputsReg = [
      {
        selector: '#regUserName',
        amount: 25
      }, {
        selector: '#regEmail',
        amount: 25
      }, {
        selector: '#regPassword',
        amount: 25
      }, {
        selector: '#regSecondPass',
        amount: 25
      }    
    ];

    // registration form inputs
    var inputsRegOpt = [
      {
        selector: '#reg-occupation',
        amount: 25
      }, {
        selector: '#reg-birthday',
        amount: 25
      }, {
        selector: '#reg-appuse',
        amount: 25
      }, {
        selector: '#diff-geo-address',
        amount: 25
      }    
    ]; */

  /*=========================================================================== 

  Controller

  ============================================================================*/
    
    // checks if checkbox is checked then activates container
    function checkboxActivate(checkButton, checkContainer, progressBar, progressBarOther) {
      checkButton.addEventListener('change', function () {
        if (this.active) {
          checkContainer.classList.add("active");
          progressBar.classList.add("active");
          progressBarOther.classList.remove("active");
        } 
        else {
          checkContainer.classList.remove("active");
          progressBar.classList.remove("active");
          progressBarOther.classList.add("active");
        };
      });
    }; 

    // checkboxActivate objects
    pCheckbox = new checkboxActivate(pInfo, pInfoContainer, regProgressBarOpt, regProgressBar);

    // adds logic for progress bar display
    function ProgressActivate(button, aContainer, aProgress, dProgress) {
      button.addEventListener("click", function(){
        aContainer.classList.add('active');
        aProgress.classList.add('active');
        dProgress.classList.remove('active');
      });
    };

    // creates the constructor extension for the login progress
    // review prototypes again to figure out the correct functionality to hide progress bars
    ProgressActivate.prototype = {
      loginProgressHide: function(container) {
        container.addEventListener('change', function(){
        if (container.style.display ="none" && container == loginContainer) {
          aProgress.classList.remove('active');
        };
      })}
    };

    // ProgressCheck objects
    logProgressCheck = new ProgressActivate(lFormButton,loginContainer, loginProgressBar,regProgressBar);
    regProgressCheck = new ProgressActivate(lFormRegButton,regContainer, regProgressBar,loginProgressBar);

    // object to remove 'active' class from all progress bars
    function HideProgress(button) {
      button.addEventListener("click", function(){
        var ProgressBars = [loginProgressBar, regProgressBar, regProgressBarOpt];
        for (var i = 0; i < ProgressBars.length; i++) {
          var ProgBar = ProgressBars[i];
          ProgBar.classList.remove('active');
        };
      });
    };

    loginHideProgress = new HideProgress(View.lButton);
    registrationHideProgress = new HideProgress(View.rButton);

    // progress tracker init
    function ProgressTracker (inputs, progressBar) {
      var self = this;
      this.progressBar = progressBar;
      this.inputs = inputs;

      this.inputs.forEach(function (input) {
        input.element = document.querySelector(input.selector);
        input.added = false;
        input.isValid = null;

        input.element.oninput = function () {
          input.isValid = self.determineStatus(input);
          self.adjustProgressIfNecessary(input);
        };
      });
    };

    // progress tracker value check
    ProgressTracker.prototype = {
      determineStatus: function (input) {
        var isValid = false;
        
        if (input.element.value.length > 0) {
          isValid = true;
        } else {
          isValid = false;
        }

        try {
          isValid = isValid && input.element.validate();
        } catch (e) {
          console.log(e);
        }
        return isValid;
      },
      adjustProgressIfNecessary: function (input) {
        var newAmount = this.progressBar.value;

        if (input.added && !input.isValid) {
          newAmount = newAmount - input.amount;
          input.added = false;
        } else if (!input.added && input.isValid) {
          newAmount = newAmount + input.amount;
          input.added = true;
        }
        this.progressBar.value = newAmount;
      }
    };

    // creates logic objects
    // login bar progress tracker
    var progressTracker = new ProgressTracker(inputs, progressBar);

    // registration progress tracker
    var progressBarReg = new ProgressTracker(inputsReg, regProgressBar);

    // registration optional progress tracker
    var progressBarRegOpt = new ProgressTracker(inputsRegOpt, regProgressBarOpt);
  
  /*=========================================================================== 

  Google Geolocate API 

  ============================================================================*/

// This example displays an address form, using the autocomplete feature
      // of the Google Places API to help users fill in the information.

      // This example requires the Places library. Include the libraries=places
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
      var placeSearch, autocomplete;
      var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      };
      function initAutocomplete() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('geo-address')),
            {types: ['geocode']});

        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        autocomplete.addListener('place_changed', fillInAddress);

        // object created to populate different address field when field is active
        autocomplete2 = new google.maps.places.Autocomplete(document.getElementById('diff-geo-address'), { types: [ 'geocode' ] });
        autocomplete2.addListener('place_changed', function() {
          fillInAddress();
        });
      }

      function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        for (var component in componentForm) {
          document.getElementById(component).value = '';
          document.getElementById(component).disabled = false;
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
          }
        }
      }

      // Bias the autocomplete object to the user's geographical location,
      // as supplied by the browser's 'navigator.geolocation' object.
      function geolocate() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
              center: geolocation,
              radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
          });
        }
      };

  /*=========================================================================== 

  Google Geolocate API end

  ============================================================================*/

  /*=========================================================================== 

  Controller end

  ============================================================================*/

/*=========================================================================== 

MVC end

============================================================================*/