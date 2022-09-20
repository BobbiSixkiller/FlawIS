import { FC } from "react";
import { useField } from "formik";
import { CheckboxProps, Form } from "semantic-ui-react";

interface CheckBoxfieldProps extends CheckboxProps {
  name: string;
}

const CheckboxField: FC<CheckBoxfieldProps> = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name);

  return (
    <Form.Checkbox
      error={meta.touched && meta.error}
      {...props}
      checked={field.value}
      onChange={() => helpers.setValue(!field.value)}
    />
  );
};

export default CheckboxField;
