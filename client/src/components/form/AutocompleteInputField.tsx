import { useField, useFormikContext } from "formik";
import { Form } from "semantic-ui-react";
import { useUserTextSearchLazyQuery } from "../../graphql/generated/schema";

export default function AutocompleteInputField({
  name,
  label,
  placeholder,
}: {
  name: string;
  placeholder: string;
  label: string;
}) {
  const [field, meta, helpers] = useField(name);
  const { status, setStatus } = useFormikContext();

  const [search, { loading, data }] = useUserTextSearchLazyQuery();

  const error = (meta.touched && meta.error) || (status && status[field.name]);

  return (
    <Form.Select
      fluid
      selection
      search={true}
      options={
        data
          ? data?.userTextSearch.map((user) => ({
              key: user.id,
              text: user.name,
              value: user.id,
            }))
          : []
      }
      value={field.value}
      name={name}
      label={label}
      placeholder={placeholder}
      onChange={(e, { value }) => {
        helpers.setValue(value);
        setStatus({ ...status, [field.name]: undefined });
      }}
      onSearchChange={async (e, { searchQuery }) => {
        await search({ variables: { text: searchQuery } });
      }}
      loading={loading}
      error={error}
    />
  );
}
