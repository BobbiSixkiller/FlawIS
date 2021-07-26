import React from "react";
import { useField } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

export default function SelectInput({ ...props }) {
  const [field, meta] = useField(props);
  const error = meta.touched && meta.error;
  const valid = meta.touched && !error;

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
          <option key={o.value} value={o.value}>
            {o.name}
          </option>
        ))}
      </Input>
      <FormFeedback invalid="true">{error}</FormFeedback>
      <FormFeedback valid>{props.label} OK!</FormFeedback>
    </FormGroup>
  );
}
