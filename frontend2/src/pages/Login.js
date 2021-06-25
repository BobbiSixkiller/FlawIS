import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import api from "../util/ClientConfig";

const initialState = {
	email: "",
	password: "",
};

export default function Login() {
	const location = useLocation();
	const history = useHistory();

	let { from } = location.state || { from: { pathname: "/" } };

	const [values, setValue] = useState(initialState);
	const [backendError, setBackendError] = useState(null);

	function handleChange(e) {
		setValue({ ...values, [e.target.name]: e.target.value });
	}

	async function login() {
		try {
			await api.post("user/login", values);
			history.replace(from);
		} catch (error) {
			setBackendError(error.response.data);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		login();
	}

	return (
		<form onSubmit={handleSubmit}>
			<input
				name="email"
				placeholder="email"
				value={values.email}
				onChange={handleChange}
			/>
			<input
				name="password"
				placeholder="password"
				value={values.password}
				onChange={handleChange}
			/>
			<button type="submit">LOGIN</button>
			{backendError && <p>{backendError.map((error) => `${error}, `)}</p>}
		</form>
	);
}
