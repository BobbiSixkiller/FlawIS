import { useField, useFormikContext } from "formik";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Dropdown, Form, Label } from "semantic-ui-react";

export default function BillingInput({
  placeholder,
  label,
  name,
  data,
}: {
  placeholder: string;
  label: string;
  name: string;
  data: any[];
}) {
  const [options, setOptions] = useState(data);
  const [field, meta, _helpers] = useField(name);
  const { setFieldValue } = useFormikContext();
  const { t } = useTranslation();

  return (
    <Form.Field error={meta.touched && meta.error}>
      <label>{label}</label>
      <Dropdown
        value={field.value}
        allowAdditions
        placeholder={placeholder}
        fluid
        search
        selection
        options={options.map((o, i) => ({
          key: i,
          text: o.name,
          value: o.name,
        }))}
        onChange={(e, { value }) => {
          const billing = data.find((b) => b.name === value);
          if (billing) {
            return setFieldValue("billing", {
              name: value,
              address: {
                street: billing.address.street,
                city: billing.address.city,
                postal: billing.address.postal,
                country: billing.address.country,
              },
              ICO: billing.ICO,
              DIC: billing.DIC,
              ICDPH: billing.ICDPH,
            });
          } else
            setFieldValue("billing", {
              name: value,
              address: {
                street: "",
                city: "",
                postal: "",
                country: "",
              },
              ICO: "",
              DIC: "",
              ICDPH: "",
            });
        }}
        onAddItem={(e, { value }) =>
          setOptions((prev) => [...prev, { name: value }])
        }
      />
      {meta.touched && meta.error && (
        <Label prompt pointing>
          {meta.error}
        </Label>
      )}
    </Form.Field>
  );
}
