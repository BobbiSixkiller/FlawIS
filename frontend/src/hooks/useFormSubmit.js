import { useReducer, useEffect, useState } from "react";

import API from "../api";

function formSUbmitReducer(action, state) {
	switch (action.type) {
		//backend
		case "INIT":
			return { ...state, loading: true, error: false };
		case "SUCCESS":
			return { ...state, loading: false, error: false, data: action.payload };
		case "FAILURE":
			return { ...state, loading: false, error: true, data: action.payload };
		//frontend
		case "VALUES":
			return { ...state, loading: false, error: false, values: action.payload };
		case "VALID":
			return { ...state, loading: false, error: false, valid: action.payload };
		case "ERROR":
			return { ...state, loading: false, error: true, errors: action.payload };
		default:
			return { ...state };
	}
}

export default function useFormSubmit(initialState, validate, url, method) {
	const [submitting, setSubmitting] = useState(false);
	const [state, dispatch] = useReducer(formSUbmitReducer, initialState);

	useEffect(() => {
		let cancel = false;

		async function sendData() {
			try {
				dispatch({ type: "INIT" });
				const res = await API.request({ url, method, data: state.values });
				if (!cancel) {
					dispatch({ type: "SUCCESS", payload: res.data });
				}
			} catch (error) {
				if (!cancel) {
					dispatch({ type: "FAILURE", payload: error.response.data });
				}
			}
		}

		if (isSubmitting) {
			const noErrors = Object.keys(errors).length === 0;
			if (noErrors) {
				sendData();
				setSubmitting(false);
			} else {
				setSubmitting(false);
			}
		}

		return () => (cancel = true);
	}, [state, submitting]);

	function handleChange(e) {
		console.log("CHANGE");

		switch (e.target.name) {
			case "files":
				return dispatch({
					type: "VALUES",
					payload: { ...state, [e.target.name]: e.target.files },
				});

			default:
				return dispatch({
					type: "VALUES",
					payload: { ...state, [e.target.name]: e.target.value },
				});
		}
	}

	function handleBlur() {
		console.log("BLUR");

		const { errors, valid } = validate(state.data);
		dispatch({ type: "VALID", payload: { ...state, valid } });
		dispatch({ type: "ERROR", payload: { ...state, errors } });
	}

	function handleSubmit(e) {
		console.log("SUBMIT");

		e.preventDefault();
		const { errors, valid } = validate(values);
		dispatch({ type: "VALID", payload: { ...state, valid } });
		dispatch({ type: "ERROR", payload: { ...state, errors } });
		setSubmitting(true);
	}

	return { handleChange, handleBlur, handleSubmit, state, dispatch };
}
