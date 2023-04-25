import { useField, useFormikContext } from "formik";
import { useTranslation } from "next-i18next";
import React, {
  ChangeEvent,
  FC,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DropdownProps,
  Form,
  FormFieldProps,
  Label,
  Select,
  SelectProps,
  Transition,
} from "semantic-ui-react";
import useOnClickOutside from "../../hooks/useOnClickOutside";

export interface InputFieldProps extends FormFieldProps {
  name: string;
  fluid?: boolean;
  placeholder?: string;
  localizedOptions?: { key: number; text: string; value: string }[];
  onAddItemLocalized?: (e: SyntheticEvent, data: SelectProps) => void;
}

export const InputField: FC<InputFieldProps> = (props) => {
  const [field, meta, helpers] = useField(props.name);
  const { status, setStatus } = useFormikContext();

  useEffect(() => {
    if (props.type === "date") {
      if (field.value) {
        helpers.setValue(field.value.split("T")[0]);
      }
    }
  }, []);

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

  const [field, meta, helpers] = useField(props.name);
  const namePathsArray = props.name.split(".");
  const [localizedField, localizedMeta, localizedHelpers] = useField(
    namePathsArray.length > 1
      ? namePathsArray.shift() + ".translations[0]." + namePathsArray.join(".")
      : "translations[0]." + props.name
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
            if (props.multiple && value) {
              console.log(field.value);
              helpers.setValue(value);
            } else {
              field.onChange(e);
            }
            setStatus({ ...status, [field.name]: undefined });
          }}
          error={error || localizedError}
        />
        <Transition visible={toggle} animation="scale" duration={500}>
          <Form.Field
            {...props}
            label={`${props.label} ${
              i18n.language === "sk" ? "anglicky" : "in slovak"
            }`}
            {...localizedField}
            onChange={(e: ChangeEvent, { value }: SelectProps) => {
              //Form field is a react semantic UI Select Component
              if (props.multiple && value) {
                console.log(field.value);
                localizedHelpers.setValue(value);
              } else {
                localizedField.onChange(e);
              }
              setStatus({ ...status, [localizedField.name]: undefined });
            }}
            options={props.localizedOptions}
            onAddItem={props.onAddItemLocalized}
            error={localizedError}
          />
        </Transition>
      </div>
    </Form.Field>
  );
};
