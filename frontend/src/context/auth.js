import React, { useState, useEffect, useReducer, createContext } from "react";

import API from "../api";

const INITIAL_STATE = {
	user: null,
	msg: "",
	error: "",
};

const AuthContext = createContext({
	user: null,
	login: function (data) {},
	logout: function () {},
});

function authReducer(state, action) {
	switch (action.type) {
		case "LOGIN":
			return {
				...state,
				user: action.payload.user,
				msg: action.payload.msg,
				error: action.payload.error,
			};
		case "LOGOUT":
			return {
				...state,
				user: null,
				msg: action.payload.msg,
				error: null,
			};
		case "HIDE_MSG":
			return {
				...state,
				msg: null,
			};
		case "HIDE_ERROR":
			return {
				...state,
				error: null,
			};

		default:
			return { ...state };
	}
}

function AuthProvider({ children }) {
	const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);
	const [loading, setLoading] = useState(true);
	//temporary solution of fulltext search for users and grants
	const [search, setSearch] = useState("");

	useEffect(() => {
		async function currentUser() {
			try {
				const user = await API.get("user/me");
				login(user.data);
				setLoading(false);
			} catch (error) {
				console.log(error.response);
				setLoading(false);
			}
		}

		currentUser();
	}, []);

	function login(data) {
		dispatch({
			type: "LOGIN",
			payload: data,
		});
	}

	function logout(data) {
		dispatch({
			type: "LOGOUT",
			payload: data,
		});
	}

	function hideMsg() {
		dispatch({ type: "HIDE_MSG" });
	}

	function hideError() {
		dispatch({ type: "HIDE_ERROR" });
	}

	return (
		<AuthContext.Provider
			value={{
				user: state.user,
				error: state.error,
				msg: state.msg,
				login,
				logout,
				hideError,
				hideMsg,
				loading,
				search,
				setSearch,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export { AuthContext, AuthProvider };
