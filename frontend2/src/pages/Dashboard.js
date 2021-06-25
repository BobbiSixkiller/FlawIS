import { useContext } from "react";

import { AuthContext } from "../context/auth";

export default function Dashboard() {
	const { loading, user, msg } = useContext(AuthContext);

	if (loading) {
		return <p>Loading...</p>;
	} else if (user) {
		return (
			<div>
				<h1>DASHBOARD</h1>
				<h2>{msg}</h2>
			</div>
		);
	}
}
