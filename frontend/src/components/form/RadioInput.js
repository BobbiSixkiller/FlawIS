import React from "react";
import { getIn } from "formik";

import { CustomInput, FormGroup } from "reactstrap";

export default function RadioInput({ field, form, ...props }) {
	return (
		<FormGroup>
			{props.buttons.map((b, i) => (
				<CustomInput
					key={i}
					id={b.value}
					value={b.value}
					label={b.label}
					inline
					onChange={() => form.setFieldValue(field.name, b.value)}
					{...props}
					{...field}
				></CustomInput>
			))}
		</FormGroup>
	);
}
