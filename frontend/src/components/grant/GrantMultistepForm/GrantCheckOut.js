import React from "react";

import { Jumbotron, Fade, Button, Spinner, Container, Row, FormGroup, Input, Label, Col } from 'reactstrap';

import Budget from "../Budget";

function GrantCheckOut(props) {
	const { grant, users, addGrant, step, setStep } = props;

	return(
		<Fade>
			<Container>
				<Jumbotron>
					<h1>{grant.name}</h1>
					<Row className="my-3" form>
						<FormGroup>
							<Col>
								<Label for="grantID">ID:</Label>
								<Input id="grantID" plaintext readOnly value={grant.idNumber} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="grantType">Typ:</Label>
								<Input id="grantType" plaintext readOnly value={grant.type} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="start">Začiatok grantu:</Label>
								<Input id="start" plaintext readOnly value={new Date(grant.start).toDateString()} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="end">Koniec grantu:</Label>
								<Input id="end" plaintext readOnly value={new Date(grant.start).toDateString()} />
							</Col>
						</FormGroup>
					</Row>
				</Jumbotron>
				<Budget budget={grant.budget} users={users} checkout={true} />
				<Container>
	              	<Row form className="justify-content-between">
						<Button outline color="primary" onClick={() => setStep(step - 1)}>Späť</Button>
	                	<Button color="success" onClick={addGrant}>Potvrdiť</Button>
	              	</Row>
				</Container>
			</Container>
		</Fade>
	);
}

export default GrantCheckOut;