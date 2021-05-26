import React from "react";
import api from "../api";

//REFACTOR ze pridam akciu komponentu ako argument, teda useState hook
export default function useAPI(endpoint, method, token) {
	const [value, setValue] = React.useState([]);

	async function getData() {
		const response = await api({
			method: method,
			url: endpoint,
			headers: {
				authorization: token,
			},
		});
		setValue(response.data);
		console.log(response);
	}

	React.useEffect(() => {
		getData();
	}, []);

	return value;
}
