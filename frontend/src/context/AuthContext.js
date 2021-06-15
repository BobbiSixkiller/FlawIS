import React, { useState, useEffect, createContext } from "react";
import API from "../api";

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
	const [loggedIn, setLoggedId] = useState();

	async function isLoggedIn() {
		try {
			const res = await API.get("user/tokenIsValid");
			setLoggedId(res.data);
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		isLoggedIn();
	}, []);

	return (
		<AuthContext.Provider value={{ loggedIn, setLoggedId, isLoggedIn }}>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthContext;
