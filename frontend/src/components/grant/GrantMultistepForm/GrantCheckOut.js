import React from "react";

import { Jumbotron, Fade, Button, Spinner, Container, Row, FormGroup, Input, Label, Col } from 'reactstrap';

import Budget from "../Budget";

function GrantCheckOut(props) {

	return(
		<Fade>
			<Container>
				<Jumbotron>
					<h1>{props.grant.name}</h1>
					<Row className="my-3" form>
						<FormGroup>
							<Col>
								<Label for="grantID">ID:</Label>
								<Input id="grantID" plaintext readOnly value={props.grant.idNumber} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="grantType">Typ:</Label>
								<Input id="grantType" plaintext readOnly value={props.grant.type} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="start">Začiatok grantu:</Label>
								<Input id="start" plaintext readOnly value={new Date(props.grant.start).toDateString()} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="end">Koniec grantu:</Label>
								<Input id="end" plaintext readOnly value={new Date(props.grant.start).toDateString()} />
							</Col>
						</FormGroup>
					</Row>
				</Jumbotron>
				<Budget budget={props.grant.budget} users={props.users} checkout={true} />
				<Container>
	              	<Row form className="justify-content-between">
						<Button outline color="primary" onClick={() => props.setStep(props.step - 1)}>Späť</Button>
	                	<Button color="success" onClick={props.addGrant}>Potvrdiť</Button>
	              	</Row>
				</Container>
			</Container>
		</Fade>
	);
}

export default GrantCheckOut;