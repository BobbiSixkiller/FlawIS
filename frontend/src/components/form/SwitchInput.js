import React from "react";
import { useField } from "formik";

import { CustomInput, FormGroup } from "reactstrap";

export default function SwitchInput(props) {
	const [field] = useField(props);

	return (
		<FormGroup>
			<CustomInput
				type="switch"
				onChange={() => console.log(field.active)}
				{...field}
				{...props}
			/>
		</FormGroup>
	);
}
