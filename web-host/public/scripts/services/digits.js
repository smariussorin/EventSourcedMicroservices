'use strict';

app
  .filter('digits', [function(){
    return function(input, digits) {
      if (digits === 2) {
        if (input < 10) {
          input = '0' + input;
        }
      }
      if (digits === 3) {
        if (input < 10) {
          input = '00' + input;
        } else if (input >= 10 && input < 100) {
          input = '0' + input;
        }
      }
      if (digits === 4) {
        if (input < 10) {
          input = '000' + input;
        } else if (input >= 10 && input < 100) {
          input = '00' + input;
        } else if (input >= 100 && input < 1000) {
          input = '0' + input;
        }
      }
      if (digits === 5) {
        if (input < 10) {
          input = '0000' + input;
        } else if (input >= 10 && input < 100) {
          input = '000' + input;
        } else if (input >= 100 && input < 1000) {
          input = '00' + input;
        } else if (input >= 1000 && input < 10000) {
          input = '0' + input;
        }
      }
      if (digits === 6) {
        if (input < 10) {
          input = '00000' + input;
        } else if (input >= 10 && input < 100) {
          input = '0000' + input;
        } else if (input >= 100 && input < 1000) {
          input = '000' + input;
        } else if (input >= 1000 && input < 10000) {
          input = '00' + input;
        } else if (input >= 10000 && input < 100000) {
          input = '0' + input;
        }
      }

      return input;
    };
  }]);
