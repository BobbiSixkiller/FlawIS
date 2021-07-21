import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import { Fade, Row } from "reactstrap";

import { AuthContext } from "../context/auth";

export default function Home() {
	const { user } = useContext(AuthContext);

	if (user) return <Redirect to="/dashboard" />;

	return (
		<Fade>
			<Row className="justify-content-center">
				<img
					className="img-fluid"
					src={process.env.PUBLIC_URL + "/flawis-logo.png"}
					alt="Logo main"
				></img>
			</Row>
		</Fade>
	);
}
