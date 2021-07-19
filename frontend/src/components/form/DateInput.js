import React from "react";
import { getIn } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

export default function DateInput({ field, form, ...props }) {
  const error =
    getIn(form.touched, field.name) && getIn(form.errors, field.name);
  const valid = getIn(form.touched, field.name) && !error;

  return (
    <FormGroup>
      <Label for={field.name}>{props.label}:</Label>
      <Input
        type="date"
        id={field.name}
        invalid={error && true}
        valid={valid && true}
        {...field}
        {...props}
      />
      <FormFeedback invalid="true">{error}</FormFeedback>
      <FormFeedback valid>{props.label} OK!</FormFeedback>
    </FormGroup>
  );
}
