import { useState, useEffect } from "react";

export default function useFormValidation(initialState, validate, action) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      const noErrors = Object.keys(errors).length === 0;
      if (noErrors) {
        action();
        setSubmitting(false);
      } else {
        setSubmitting(false);
      }
    }
  }, [errors, isSubmitting, action]);

  function handleChange(e) {
    switch (e.target.name) {
      case "files":
        return setValues({
          ...values,
          [e.target.name]: e.target.files,
        });

      default:
        return setValues({
          ...values,
          [e.target.name]: e.target.value,
        });
    }
  }

  function handleBlur() {
    const { errors, valid } = validate(values);
    setErrors(errors);
    setValid(valid);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { errors, valid } = validate(values);
    setErrors(errors);
    setValid(valid);
    setSubmitting(true);
  }

  return {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    setValues,
    errors,
    valid,
  };
}
