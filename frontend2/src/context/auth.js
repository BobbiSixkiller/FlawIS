import React, {
	useCallback,
	useReducer,
	createContext,
	useEffect,
	useState,
} from "react";

import API from "../util/ClientConfig";

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
	const [loading, setLoading] = useState(false);

	const login = useCallback((data) => {
		dispatch({
			type: "LOGIN",
			payload: data,
		});
	}, []);

	useEffect(() => {
		async function isLoggedIn() {
			try {
				setLoading(true);
				const user = await API.get("user/me");
				login(user.data);
				setLoading(false);
			} catch (error) {
				setLoading(false);
				console.log(error);
			}
		}
		isLoggedIn();
	}, [login]);

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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export { AuthContext, AuthProvider };
