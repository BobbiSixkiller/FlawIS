import React from "react";
import { useField } from "formik";

import { FormGroup, Label, Input } from "reactstrap";

export default function RadioInput({ inline, label, ...props }) {
  const [field] = useField(props);

  return (
    <FormGroup check inline={inline}>
      <Label check>
        <Input type="radio" {...field} />
        {label}
      </Label>
    </FormGroup>
  );
}
