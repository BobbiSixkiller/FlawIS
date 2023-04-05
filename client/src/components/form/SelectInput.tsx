import { useField } from "formik";
import { Dropdown, DropdownProps, Form, Label } from "semantic-ui-react";

export default function SelectInput({
	name,
	label,
	placeholder,
	options,
}: {
	name: string;
	placeholder: string;
	label: string;
	options: { key: number | string; text: string; value: string }[];
} & DropdownProps) {
	const [field, meta, helpers] = useField(name);

	return (
		<Form.Field error={meta.error}>
			<label>{label}</label>
			<Dropdown
				value={field.value}
				allowAdditions
				placeholder={placeholder}
				fluid
				search
				selection
				options={options}
				onChange={(e, { value }) => {
					helpers.setValue(value);
				}}
			/>
			{meta.error && (
				<Label prompt pointing>
					{meta.error}
				</Label>
			)}
		</Form.Field>
	);
}
