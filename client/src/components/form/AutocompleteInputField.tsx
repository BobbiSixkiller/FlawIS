import { useField } from "formik";
import { useState } from "react";
import { Dropdown, Form } from "semantic-ui-react";
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
  // const [searchValue, setSearchValue] = useState<
  // 	boolean | number | string | (boolean | number | string)[]
  // >();
  const [options, setOptions] = useState<
    { key: string; text: string; value: string }[]
  >([]);

  const [search, { loading, data }] = useUserTextSearchLazyQuery({
    onCompleted: ({ userTextSearch }) =>
      setOptions(
        userTextSearch.map((user) => ({
          key: user.id,
          text: user.name,
          value: user.id,
        }))
      ),
  });

  const error = meta.touched && meta.error;

  return (
    <Form.Field error={error}>
      <label>{label}</label>
      <Form.Select
        fluid
        selection
        search={true}
        options={options}
        value={field.value}
        name={name}
        labeled
        placeholder={placeholder}
        onChange={(e, { value }) => helpers.setValue(value)}
        onSearchChange={async (e, { searchQuery }) => {
          console.log(searchQuery);
          await search({ variables: { text: searchQuery } });
        }}
        loading={loading}
        error={error as boolean}
      />
    </Form.Field>
  );
}
