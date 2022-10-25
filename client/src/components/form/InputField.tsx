import { useField, useFormikContext } from "formik";
import { FC } from "react";
import { Form, FormFieldProps } from "semantic-ui-react";

export interface inputFieldProps extends FormFieldProps {
  name: string;
  fluid: boolean;
  placeholder?: string;
}

const InputField: FC<inputFieldProps> = (props) => {
  const [field, meta, _helpers] = useField(props.name);

  const { status, setStatus } = useFormikContext();

  const error = (meta.touched && meta.error) || (status && status[field.name]);

  return (
    <Form.Field
      {...props}
      {...field}
      onChange={(e) => {
        field.onChange(e);
        setStatus({ ...status, [field.name]: undefined });
      }}
      error={error}
    />
  );
};

export default InputField;
