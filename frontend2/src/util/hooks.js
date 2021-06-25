import { useState, useEffect } from "react";

export function useFormValidation(initialState, validate, action) {
	const [values, setValues] = useState(initialState);
	const [errors, setErrors] = useState({});

	function handleChange(values) {}

	function handleBlur(values) {}

	function handleSubmit(values) {}

	return { values, errors, handleChange, handleBlur, handleSubmit };
}
