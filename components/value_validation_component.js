import React from 'react';
import validate from '../utils/validate';

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
    if (nextProps.shouldValidate && !this.props.shouldValidate) {
      this.validate(true);
    }
    if (nextProps.value != this.props.value && nextProps.value != this.state.value) {
      this.setState({ value: nextProps.value }, () => {
        this.validate();
      });
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
    if (this.state.value) this.validate(true);
  }

  validate(alwaysChangeValidState = false) {
    var valid = this.isValid(this.state.value);
    var fromPendingToValid = this.state.valid == undefined && valid;
    var validChanged = this.state.valid != undefined && this.state.valid != valid;
    if (fromPendingToValid || validChanged || alwaysChangeValidState) {
      this.setState({valid});
      if (this.props.onValidation) {
        this.props.onValidation(this.props.name, valid);
      }
    }
    return valid;
  }

  // Returns true (valid), false (invalid), undefined (pending)
  // or null (no validatation needed).
  isValid(value) {
    // Disabled fields shall not be validated.
    if (this.props.disabled) return null;

    // Non-required fields with falsy values are valid,
    // regardless of their other validation props:
    if (!this.props.required && !value) return true;

    // Otherwise every validation prop must be evaluated.
    return ValueValidationComponent.validationProps.every(function(prop) {
      if (prop in this.props) {
        return validate(prop, this.props[prop], value);
      }
      return true;
    }, this);
  }
}
