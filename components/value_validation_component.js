import React from 'react';

// ValueValidationComponent is in abstract component.
// Do not define static props here, see:
// https://babeljs.io/docs/usage/caveats/#classes-10-and-below-
export default class ValueValidationComponent extends React.Component {
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
    if ('value' in nextProps && nextProps.value != this.state.value) {
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

  handleChange(e) {
    var value = e.target.value;
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

  isValid(value) {
    if (this.props.required && !value) {
      return false;
    }
    return true;
  }
}
