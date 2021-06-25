import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import { Fade, Alert, Col, Row, Button } from "reactstrap";

import { AuthContext } from "../context/auth";

function Home() {
	const context = useContext(AuthContext);

	if (context.user) return <Redirect to="/dashboard" />;

	return (
		<Fade>
			{context.msg && (
				<Row className="mb-5">
					<Col>
						<Alert className="text-center" color="primary">
							{context.msg}
							<Button close onClick={() => context.hideMsg()} />
						</Alert>
					</Col>
				</Row>
			)}
			{context.error && (
				<Row className="mb-5">
					<Col>
						<Alert className="text-center" color="danger">
							{context.error}
							<Button close onClick={() => context.hideError()} />
						</Alert>
					</Col>
				</Row>
			)}
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

export default Home;
