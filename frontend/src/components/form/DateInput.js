import React from "react";
import { useField } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

export default function DateInput({ label, ...props }) {
  const [field, meta] = useField(props);
  const error = meta.touched && meta.error;
  const valid = meta.touched && !error;

  console.log(field.value);

  return (
    <FormGroup>
      <Label for={field.name}>{label}:</Label>
      <Input
        type="date"
        id={field.name}
        invalid={error && true}
        valid={valid && true}
        {...field}
        {...props}
      />
      <FormFeedback invalid="true">{error}</FormFeedback>
      <FormFeedback valid>{label} OK!</FormFeedback>
    </FormGroup>
  );
}
