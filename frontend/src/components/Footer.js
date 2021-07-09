import React from "react";
import { Row, Col } from "reactstrap";

function Footer() {
	return (
		<Row className="justify-content-center bg-light">
			<Col className="py-5">
				<p className="text-center text-muted">
					© Právnická fakulta, Univerzita Komenského 2020
				</p>
				<p className="text-center text-muted">
					Technický kontakt: matus.muransky@flaw.uniba.sk
				</p>
			</Col>
		</Row>
	);
}

export default Footer;
