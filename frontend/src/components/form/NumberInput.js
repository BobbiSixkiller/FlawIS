import React from "react";
import { useField } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

export default function NumberInput({ ...props }) {
  const [field, meta] = useField(props);
  const error = meta.touched && meta.error;
  const valid = meta.touched && !error;

  return (
    <FormGroup>
      <Label for={field.name}>{props.label}:</Label>
      <Input
        type="number"
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
