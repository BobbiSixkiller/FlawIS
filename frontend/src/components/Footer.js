import React from 'react';
import { Container, Row, Col } from 'reactstrap';

function Footer(props) {

	return(
		<Container fluid>
			<Row className="justify-content-center bg-light">
				<Col className="py-5">
					<p className="text-center text-muted">© Právnická fakulta, Univerzita Komenského 2020</p>
					<p className="text-center text-muted">Technický kontakt: matus.muransky@flaw.uniba.sk</p>					
				</Col>
			</Row>
		</Container>
	);
}

export default Footer;