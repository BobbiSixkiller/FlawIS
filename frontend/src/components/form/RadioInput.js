import React from "react";
import { useField, useFormikContext } from "formik";

import { CustomInput } from "reactstrap";

export default function RadioInput({ name, type, value, ...props }) {
  const [field, meta, helpers] = useField({ name, type, value });
  const { setFieldValue } = useFormikContext();

  return (
    <CustomInput
      type="radio"
      {...field}
      {...props}
      onChange={() => {
        console.log(field.name + " " + field.value);
        //helpers.setValue(props.value);
        setFieldValue(field.name, field.value);
      }}
    />
  );
}
