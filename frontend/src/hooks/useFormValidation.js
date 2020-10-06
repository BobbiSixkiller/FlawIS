import React from "react";

function useFormValidation(initialState, validate, action) {
	const [values, setValues] = React.useState(initialState);
	const [errors, setErrors] = React.useState({});
	const [valid, setValid] = React.useState({});
	const [isSubmitting, setSubmitting] = React.useState(false);

	React.useEffect(() => {
		if (isSubmitting) {
			const noErrors = Object.keys(errors).length === 0
			if (noErrors) {
				action();
				setSubmitting(false);
			} else {
				setSubmitting(false);
			}
		}
	}, [errors]);

	function handleChange(e) {
		setValues({
			...values,
			[e.target.name]: e.target.value
		});
		const {errors, valid} = validate(values);
		setErrors(errors);
		setValid(valid);
	}

	function handleBlur(e) {
		const {errors, valid} = validate(values);
		setErrors(errors);
		setValid(valid);
	}

	function handleSubmit(e) {
    	e.preventDefault();
    	const {errors, valid} = validate(values);
		setErrors(errors);
		setValid(valid);
    	setSubmitting(true);
  	}

	return { handleSubmit, handleChange, handleBlur, values, setValues, errors, valid, isSubmitting }
}

export default useFormValidation;
