import React from "react";
import { useField, useFormikContext, getIn } from "formik";

import { Label, Input, FormGroup, FormFeedback } from "reactstrap";

export default function ReadOnlyInput({ label, ...props }) {
	const [field, meta] = useField(props);
	const { status } = useFormikContext();

	const error = (meta.touched && meta.error) || getIn(status, field.name);
	const valid = meta.touched && !error;

	return (
        <FormGroup>
									<Label for="member">Riešiteľ:</Label>
									<Input
										id="member"
										name="member"
										value={values.name}
										readOnly
										plaintext
									/>
								</FormGroup>
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
