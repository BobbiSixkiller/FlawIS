import { useContext } from "react";
import { AuthContext } from "../context/auth";

import Dashboard from "../pages/Dashboard";

export default function Home() {
	const { error, user } = useContext(AuthContext);

	if (user) {
		return <Dashboard />;
	} else {
		return (
			<div>
				<h1>HOME</h1>
				{error}
			</div>
		);
	}
}
