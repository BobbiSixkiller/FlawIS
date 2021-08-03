import React, { useEffect, useReducer, createContext } from "react";

import API from "../util/axiosConfig";

const AuthContext = createContext();

function authReducer(state, action) {
	switch (action.type) {
		case "INIT":
			return {
				...state,
				loading: true,
			};
		case "SUCCESS":
			return {
				...state,
				loading: false,
				user: action.payload.user,
				error: false,
				message: action.payload.message,
			};
		case "FAILURE":
			return {
				...state,
				loading: false,
				user: null,
				message: action.payload.message,
				error: true,
				errors: action.payload.errors,
			};
		case "HIDE_MSG":
			return {
				...state,
				message: null,
				error: false,
				errors: [],
			};

		default:
			return { ...state };
	}
}

function AuthProvider({ children }) {
	const [state, dispatch] = useReducer(authReducer, {
		loading: true,
		user: null,
		message: "",
		error: false,
		errors: [],
	});

	useEffect(() => {
		async function currentUser() {
			dispatch({ type: "INIT" });
			try {
				const res = await API.get("user/me");
				dispatch({ type: "SUCCESS", payload: res.data });
			} catch (error) {
				console.log(error.response);
				dispatch({ type: "FAILURE", payload: {} });
			}
		}

		currentUser();
	}, []);

	async function logout() {
		dispatch({ type: "INIT" });
		try {
			const res = await API.get("user/logout");
			dispatch({ type: "SUCCESS", payload: res.data });
		} catch (err) {
			console.log(err.response);
			dispatch({ type: "FAILURE", payload: err.response.data });
		}
	}

	function hideMessage() {
		dispatch({ type: "HIDE_MSG" });
	}

	return (
		<AuthContext.Provider
			value={{
				loading: state.loading,
				user: state.user,
				message: state.message,
				error: state.error,
				errors: state.errors,
				logout,
				hideMessage,
				dispatch,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export { AuthContext, AuthProvider };
