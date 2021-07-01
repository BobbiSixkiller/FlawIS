import { useReducer, useEffect, useState } from "react";

import API from "../api";

function formSubmitReducer(state, action) {
  switch (action.type) {
    //frontend
    case "INPUT":
      return { ...state, loading: false, values: action.payload };
    case "VALID":
      return { ...state, loading: false, valid: action.payload };
    case "ERROR":
      return { ...state, loading: false, errors: action.payload };
    //backend
    case "INIT":
      return { ...state, loading: true, error: false };
    case "SUCCESS":
      return { ...state, loading: false, error: false, res: action.payload };
    case "FAILURE":
      return { ...state, loading: false, error: true, res: action.payload };
    case "HIDE_RES":
      return { ...state, res: null };

    default:
      return { ...state };
  }
}

export default function useFormSubmit(
  initialState,
  steps,
  validate,
  url,
  method
) {
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
    async function sendData() {
      try {
        dispatch({ type: "INIT" });
        const res = await API.request({ url, method, data: state.values });
        dispatch({ type: "SUCCESS", payload: res.data });
      } catch (error) {
        dispatch({ type: "FAILURE", payload: error.response.data });
      }
    }

    if (submitting) {
      const noErrors = Object.keys(state.errors).length === 0;
      if (noErrors) {
        sendData();
        setSubmitting(false);
      } else {
        setSubmitting(false);
      }
    }
  }, [state.errors, state.values, submitting, method, url]);

  function handleInputChange(e) {
    switch (e.target.name) {
      case "files":
        return dispatch({
          type: "INPUT",
          payload: { ...state.values, [e.target.name]: e.target.files },
        });

      default:
        return dispatch({
          type: "INPUT",
          payload: { ...state.values, [e.target.name]: e.target.value },
        });
    }
  }

  function handleArrayPush(item, arrayName) {
    const array = state.values[arrayName];
    const update = [...array, item];

    dispatch({
      type: "INPUT",
      payload: { ...state.values, [arrayName]: update },
    });
  }

  function handleArrayFilter(item, arrayName) {
    const array = state.values[arrayName];

    dispatch({
      type: "INPUT",
      payload: {
        ...state.values,
        [arrayName]: array.filter((e) => e !== item),
      },
    });
  }

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
    handleArrayPush,
    handleArrayFilter,
    handleBlur,
    handleSubmit,
    hideRes,
    state,
    dispatch,
  };
}
