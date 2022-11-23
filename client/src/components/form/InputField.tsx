import { useField, useFormikContext } from "formik";
import React, { ChangeEvent, FC, useRef, useState } from "react";
import { Form, FormFieldProps, Transition } from "semantic-ui-react";
import useOnClickOutside from "../../hooks/useOnClickOutside";

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
      onChange={(e: ChangeEvent) => {
        field.onChange(e);
        setStatus({ ...status, [field.name]: undefined });
      }}
      error={error}
    />
  );
};

const LocalizedInputField: FC<inputFieldProps> = (props) => {
  const [toggle, setToggle] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(inputRef, () => setToggle(false));

  const [field, meta, _helpers] = useField(props.name);
  const [localizedField, localizedMeta, _localizedHelpers] = useField(
    "translations[0]." + props.name
  );

  const { status, setStatus } = useFormikContext();

  const error = (meta.touched && meta.error) || (status && status[field.name]);
  const localizedError = localizedMeta.touched && localizedMeta.error;

  return (
    <Form.Field>
      <div ref={inputRef}>
        <Form.Field
          {...props}
          {...field}
          onFocus={() => setToggle(true)}
          onChange={(e: ChangeEvent) => {
            field.onChange(e);
            setStatus({ ...status, [field.name]: undefined });
          }}
          error={error}
        />
        <Transition visible={toggle} animation="scale" duration={500}>
          <Form.Field {...props} {...localizedField} error={localizedError} />
        </Transition>
      </div>
    </Form.Field>
  );
};

export { InputField, LocalizedInputField };
