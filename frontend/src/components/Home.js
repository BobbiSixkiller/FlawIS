import React from 'react';
import { useHistory } from "react-router-dom";
import { Fade, Alert, Spinner, Container, FormGroup, Col, Label, Input, Row, Jumbotron, Card, CardDeck, CardText, Button } from 'reactstrap';

import { useUser } from '../hooks/useUser';

function Home() {
	const { user, loading } = useUser();
	const history = useHistory();

	if (loading === true) {
		return <Container className="text-center"><Spinner/></Container>
	} else if (user._id) {
		return (
			<Fade>
				<Jumbotron>
					<h1 className="text-center">Profil</h1>
					<Row form className="justify-content-center">
						<FormGroup row>
							<Col>
								<Label for="full-name">Meno:</Label>
								<Input id="full-name" plaintext readOnly value={user.firstName + ' ' + user.lastName} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="email">Email:</Label>
								<Input id="email" plaintext readOnly value={user.email} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="created">Dátum registrácie:</Label>
								<Input id="created" plaintext readOnly value={new Date(user.createdAt).toLocaleString()} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="modiffied">Dátum poslednej zmeny:</Label>
								<Input id="modiffied" plaintext readOnly value={new Date(user.updatedAt).toLocaleString()} />
							</Col>
						</FormGroup>
					</Row>
					<hr />
					<CardDeck>
	    				<Card body inverse color="primary">
							<h5 class="card-title">Moje Granty</h5>
							<CardText>Modul poskytuje informácie ohľadne rozpočtu a hodín alokovaných v príslušných grantoch, v ktorých ste zapojený.</CardText>
							<Button color="info" onClick={() => history.push("/mygrants")}>Zobraziť</Button>
						</Card>
						<Card body inverse color="danger">
							<h5 class="card-title">Nástenka</h5>
							<CardText>Modul poskytuje informácie ohľadne vedeckej práce pedagogických pracovníkov fakulty</CardText>
							<Button color="info" onClick={() => history.push("/mywork")}>Zobraziť</Button>
						</Card>
	    			</CardDeck>
				</Jumbotron>
			</Fade>
		);
	} else {
		return (
			<div>
				<Row className="justify-content-center mb-3">
					<img src={process.env.PUBLIC_URL + '/Praf-UK-logo.png'} alt="Logo main" width="200" height="200"></img>
				</Row>
	    		<h1 className="text-center">Prosím prihláste sa</h1>
	    		{user.error && 
					<Col className="my-5">
						<Alert className="text-center" color="danger">{user.error}</Alert>
					</Col>
				}
			</div>
		);
	}
}

export default Home;