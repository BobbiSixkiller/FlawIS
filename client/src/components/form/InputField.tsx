import { useField, useFormikContext } from "formik";
import { useTranslation } from "next-i18next";
import React, { ChangeEvent, FC, useRef, useState } from "react";
import {
  Form,
  FormFieldProps,
  SelectProps,
  Transition,
} from "semantic-ui-react";
import useOnClickOutside from "../../hooks/useOnClickOutside";

export interface InputFieldProps extends FormFieldProps {
  name: string;
  fluid?: boolean;
  placeholder?: string;
}

export const InputField: FC<InputFieldProps> = (props) => {
  const [field, meta, helpers] = useField(props.name);
  const { status, setStatus } = useFormikContext();

  const error = (meta.touched && meta.error) || (status && status[field.name]);

  return (
    <Form.Field
      {...props}
      {...field}
      onBlur={helpers.setTouched}
      onChange={(e: ChangeEvent, { value }: SelectProps) => {
        if (props.options) {
          helpers.setValue(value);
        } else {
          field.onChange(e);
        }
        setStatus({ ...status, [field.name]: undefined });
      }}
      error={error}
    />
  );
};

export const LocalizedInputField: FC<InputFieldProps> = (props) => {
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

  const { i18n } = useTranslation();

  return (
    <Form.Field>
      <div ref={inputRef}>
        <Form.Field
          {...props}
          {...field}
          onFocus={() => setToggle(true)}
          onChange={(e: ChangeEvent, { value }: SelectProps) => {
            //Form field is a react semantic UI Select Component
            if (value) {
              console.log(value);
            } else {
              field.onChange(e);
              setStatus({ ...status, [field.name]: undefined });
            }
          }}
          error={error}
        />
        <Transition visible={toggle} animation="scale" duration={500}>
          <Form.Field
            {...props}
            label={`${props.label} ${
              i18n.language === "sk" ? "anglicky" : "in slovak"
            }`}
            {...localizedField}
            error={localizedError}
          />
        </Transition>
      </div>
    </Form.Field>
  );
};
