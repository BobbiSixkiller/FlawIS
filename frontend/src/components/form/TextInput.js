import React from "react";
import { useField, useFormikContext, getIn } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

import { normalizeErrors } from "../../util/helperFunctions";

export default function TextInput({ label, ...props }) {
	const [field, meta] = useField(props);
	const { status, setStatus } = useFormikContext();

	const error =
		(meta.touched && meta.error) ||
		(status && getIn(normalizeErrors(status.errors), field.name));
	const valid = meta.touched && !error;

	return (
		<FormGroup>
			<Label for={field.name}>{label}:</Label>
			<Input
				id={field.name}
				invalid={error && true}
				valid={valid && true}
				{...field}
				{...props}
				onChange={(e) => {
					field.onChange(e);
					status &&
						setStatus({
							...status,
							errors: status.errors.filter((e) => e.path !== field.name),
						});
				}}
			/>
			<FormFeedback invalid="true">{error}</FormFeedback>
			<FormFeedback valid>{label} OK!</FormFeedback>
		</FormGroup>
	);
}
