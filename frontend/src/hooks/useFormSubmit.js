import { useReducer, useEffect, useState, useCallback } from "react";

import API from "../api";

function formSubmitReducer(state, action) {
	switch (action.type) {
		//backend
		case "INIT":
			return { ...state, loading: true, error: false };
		case "SUCCESS":
			return { ...state, loading: false, error: false, res: action.payload };
		case "FAILURE":
			return { ...state, loading: false, error: true, res: action.payload };
		case "HIDE_RES":
			return { ...state, res: null };
		//frontend
		case "INPUT":
			return { ...state, loading: false, values: action.payload };
		case "VALID":
			return { ...state, loading: false, valid: action.payload };
		case "ERROR":
			return { ...state, loading: false, errors: action.payload };
		default:
			return { ...state };
	}
}

export default function useFormSubmit(initialState, validate, url, method) {
	const [submitting, setSubmitting] = useState(false);
	const [state, dispatch] = useReducer(formSubmitReducer, {
		loading: false,
		error: false,
		res: "",
		values: initialState,
		valid: {},
		errors: {},
	});

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

		if (submitting) {
			const noErrors = Object.keys(state.errors).length === 0;
			if (noErrors) {
				console.log("FIRE");
				sendData();
				console.log(state.res);
				setSubmitting(false);
			} else {
				setSubmitting(false);
			}
		}

		return () => (cancel = true);
	}, [state.errors, state.values, state.res, submitting, method, url]);

	function handleInputChange(e) {
		switch (e.target.name) {
			case "files":
				return dispatch({
					type: "INPUT",
					payload: { ...state.values, [e.target.name]: e.target.files },
				});

			default:
				const inputs = { ...state.values };
				console.log(inputs);

				return dispatch({
					type: "INPUT",
					payload: { ...state.values, [e.target.name]: e.target.value },
				});
		}
	}

	function handleValueChange(value, key) {
		dispatch({ type: "INPUT", payload: { ...state.values, [key]: value } });
	}

	const valueChangeCb = useCallback(
		(key, value) => {
			dispatch({ type: "INPUT", payload: { ...state.values, [key]: value } });
		},
		[state.values]
	);

	function handleBlur() {
		const { errors, valid } = validate(state.values);
		dispatch({ type: "VALID", payload: valid });
		dispatch({ type: "ERROR", payload: errors });
	}

	function handleSubmit(e) {
		e.preventDefault();
		const { errors, valid } = validate(state.values);
		dispatch({ type: "VALID", payload: valid });
		dispatch({ type: "ERROR", payload: errors });
		setSubmitting(true);
	}

	function hideRes() {
		dispatch({ type: "HIDE_RES" });
	}

	return {
		handleInputChange,
		handleValueChange,
		valueChangeCb,
		handleBlur,
		handleSubmit,
		hideRes,
		state,
		dispatch,
	};
}
