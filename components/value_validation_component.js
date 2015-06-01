import React from 'react';
import validate from '../utils/validate';
import validationStates from '../utils/validation_states';

// ValueValidationComponent is an abstract component.
// The static props of this class will not be inherited on IE <= 10,
// see: https://babeljs.io/docs/usage/caveats/#classes-10-and-below-
export default class ValueValidationComponent extends React.Component {
  static validationProps = [ 'required', 'pattern', 'type', 'minAge', 'maxAge' ]

  state = {
    value: this.props.value,
    valid: this.props.value ? this.isValid(this.props.value) : undefined
  }

  componentDidMount() {
    if (this.props.onValidation) {
      // Send the initial valid state to the parent component.
      this.props.onValidation(this.props.name, this.state.valid);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value != this.props.value && nextProps.value != this.state.value) {
      this.setState({ value: nextProps.value }, () => {
        this.validate(nextProps);
      });
    } else if (nextProps.shouldValidate && !this.props.shouldValidate) {
      this.validate(nextProps, true);
    } else if (nextProps.disabled != this.props.disabled) {
      this.validate(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Ignore resetting of the validation request.
    if (nextProps.shouldValidate == false && this.props.shouldValidate) {
      return false;
    }
    return true;
  }

  // Can be override when other properties of target shall be used as value.
  getValueFromTarget(target) {
    return target.value;
  }

  handleChange(e) {
    var value = this.getValueFromTarget(e.target);
    this.setState({value}, () => {
      this.validate();
      if (this.props.onChange) {
        this.props.onChange(value);
      }
    });
  }

  handleBlur() {
    if (this.state.value) this.validate(this.props, true);
  }

  validate(props = this.props, alwaysChangeValidState = false) {
    var valid = this.isValid(this.state.value, props);
    var fromPendingToValid = this.state.valid === validationStates.PENDING && valid;
    var validChanged = this.state.valid !== validationStates.PENDING && this.state.valid !== valid;
    if (fromPendingToValid || validChanged || alwaysChangeValidState) {
      this.setState({valid});
      if (props.onValidation) {
        props.onValidation(props.name, valid);
      }
    }
    return valid;
  }

  // Returns true (valid), false (invalid), undefined (pending)
  // or null (no validatation needed).
  isValid(value, props = this.props) {
    // Disabled fields shall not be validated.
    if (props.disabled) return validationStates.NO_VALIDATION_NEEDED;

    // Non-required fields with falsy values are valid,
    // regardless of their other validation props:
    if (!props.required && !value) return validationStates.VALID;

    // Otherwise every validation prop must be evaluated.
    return ValueValidationComponent.validationProps.every(function(prop) {
      if (prop in props) {
        return validate(prop, props[prop], value);
      }
      return validationStates.VALID;
    }, this);
  }
}
