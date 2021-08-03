import React from "react";
import { useField, useFormikContext, getIn } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

export default function TextInput({ label, ...props }) {
	const [field, meta] = useField(props);
	const { status } = useFormikContext();

	const error = (meta.touched && meta.error) || getIn(status, field.name);
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
			/>
			<FormFeedback invalid="true">{error}</FormFeedback>
			<FormFeedback valid>{label} OK!</FormFeedback>
		</FormGroup>
	);
}
