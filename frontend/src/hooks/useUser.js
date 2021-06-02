import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

async function getCurrentUser(accessToken) {
	try {
		const res = await api.get("user/me", {
			headers: {
				authorization: accessToken,
			},
		});
		return res.data;
	} catch (err) {
		return err.response.data;
	}
}

const initialState = {
	user: {},
	accessToken: undefined,
	loading: false,
};

const UserContext = createContext(initialState);

export function UserProvider({ children }) {
	const [accessToken, setAccessToken] = useState(
		localStorage.getItem("authorization")
	);
	const [user, setUser] = useState({});
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");

	async function handleAccessTokenChange() {
		if (accessToken) {
			setLoading(true);
			localStorage.setItem("authorization", accessToken);
			const user = await getCurrentUser(accessToken);
			setUser(user);
			setLoading(false);
		} else {
			// Log Out
			localStorage.removeItem("authorization");
			setUser({});
			setLoading(false);
		}
	}

	useEffect(() => {
		handleAccessTokenChange();
	}, [accessToken]);

	return (
		<UserContext.Provider
			value={{
				loading,
				setLoading,
				user,
				accessToken,
				setAccessToken,
				search,
				setSearch,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}

export const useUser = () => useContext(UserContext);
