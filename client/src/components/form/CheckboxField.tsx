import { FC } from "react";
import { useField, useFormikContext } from "formik";
import { CheckboxProps, Form } from "semantic-ui-react";

interface CheckBoxfieldProps extends CheckboxProps {
  name: string;
}

const CheckboxField: FC<CheckBoxfieldProps> = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name);
  const { status, setStatus } = useFormikContext();

  const error = (meta.touched && meta.error) || (status && status[field.name]);

  return (
    <Form.Checkbox
      error={error ? { content: error, pointing: "left" } : undefined}
      {...props}
      checked={field.value}
      onChange={() => {
        helpers.setValue(!field.value);
        setStatus({ ...status, [field.name]: undefined });
      }}
    />
  );
};

export default CheckboxField;
