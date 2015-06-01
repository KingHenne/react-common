if (!console) console = {};
if (!console.warn) console.warn = function(){};

var typePatterns = {
  // E-mail and phone patterns taken from:
  // https://github.com/ericelliott/h5Validate/blob/master/jquery.h5validate.js
  email: /^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/,
  phone: /^([\+][0-9]{1,3}([ \.\-])?)?([\(][0-9]{1,6}[\)])?([0-9 \.\-]{1,32})(([A-Za-z \:]{1,11})?[0-9]{1,4}?)$/
};

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

// Taken from: http://stackoverflow.com/a/4076440
function calculateAge(birthDate, otherDate) {
  birthDate = new Date(birthDate);
  otherDate = new Date(otherDate);

  var years = (otherDate.getFullYear() - birthDate.getFullYear());

  if (otherDate.getMonth() < birthDate.getMonth() || 
      otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
      years--;
  }

  return years;
}

export default function validate(prop, expectation, value) {
  switch (prop) {
    case 'required':
      if (typeof value == 'string') value = value.trim();
      return !expectation || value;
      break;

    case 'pattern':
      if (!(expectation instanceof RegExp)) {
        expectation = RegExp(expectation);
      }
      return expectation.test(value);
      break;

    case 'type':
      switch (expectation) {
        case 'email':
        case 'phone':
          return validate('pattern', typePatterns[expectation], value);
          break;
        case 'date':
          return isValidDate(value);
        default:
          console.warn(`Validation for 'type="${expectation}"' is not implemented.`);
          return true;
      }
      break;

    case 'minAge':
      if (!isValidDate(value)) return false;
      return calculateAge(value, new Date()) >= parseInt(expectation, 10);
      break;

    case 'maxAge':
      if (!isValidDate(value)) return false;
      return calculateAge(value, new Date()) <= parseInt(expectation, 10);
      break;

    default:
      console.warn(`Validation '${prop}' is not implemented.`);
      return true;
  }
}
