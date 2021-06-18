import React, { useReducer, createContext } from "react";

const INITIAL_STATE = {
	user: null,
	msg: null,
	error: null,
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
				error: action.payload.error,
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
			return state;
	}
}

function AuthProvider({ children }) {
	const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);
	//temporary solution of fulltext search for users and grants
	const [search, setSearch] = React.useState("");

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
				search,
				setSearch,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export { AuthContext, AuthProvider };
