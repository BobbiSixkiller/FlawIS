import React from "react";
import { useField } from "formik";

import { CustomInput, FormGroup } from "reactstrap";

export default function RadioInput({ ...props }) {
  const [field, meta, helpers] = useField(props);

  return (
    <FormGroup>
      {props.options.map((option, i) => (
        <CustomInput
          key={i}
          defaultChecked={i === 0 && true}
          type="radio"
          name={field.name}
          id={option.value}
          value={option.value}
          label={option.label}
          inline
          onChange={() => helpers.setValue(option.value)}
        ></CustomInput>
      ))}
    </FormGroup>
  );
}
