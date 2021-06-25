import { useContext } from "react";
import api from "../util/ClientConfig";

import { AuthContext } from "../context/auth";

export default function Navbar() {
	const context = useContext(AuthContext);

	async function logout() {
		const res = await api.get("user/logout");
		context.logout(res.data);
	}

	return (
		<div>
			<h1>Navbar</h1>
			{context.user && <button onClick={() => logout()}>Log out</button>}
		</div>
	);
}
