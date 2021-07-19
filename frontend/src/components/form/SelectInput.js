import React from "react";
import { getIn } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

export default function SelectInput({ field, form, ...props }) {
  const error =
    getIn(form.touched, field.name) && getIn(form.errors, field.name);
  const valid = getIn(form.touched, field.name) && !error;

  return (
    <FormGroup>
      <Label for={field.name}>{props.label}:</Label>
      <Input
        type="select"
        id={field.name}
        invalid={error && true}
        valid={valid && true}
        {...field}
        {...props}
      >
        {props.options.map((o) => (
          <option value={o.value}>{o.name}</option>
        ))}
      </Input>
      <FormFeedback invalid="true">{error}</FormFeedback>
      <FormFeedback valid>{props.label} OK!</FormFeedback>
    </FormGroup>
  );
}
