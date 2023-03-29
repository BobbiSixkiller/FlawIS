import { useField } from "formik";
import { Form, Label, Radio } from "semantic-ui-react";

export default function RadioGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { label: string; value: any }[];
}) {
  const [field, meta, helpers] = useField(name);

  return (
    <Form.Field error={meta.touched && meta.error}>
      <label>{label}</label>
      {options.map((option, i) => (
        <Form.Field key={i}>
          <Radio
            label={option.label}
            name={name}
            value={option.value}
            checked={field.value === option.value}
            onChange={() => helpers.setValue(option.value)}
          />
        </Form.Field>
      ))}
      {meta.touched && meta.error && (
        <Label prompt pointing>
          {meta.error}
        </Label>
      )}
    </Form.Field>
  );
}
