import React from 'react';
import { useHistory, useRouteMatch, Redirect, Route, Switch } from "react-router-dom";
import { Fade, Alert, Spinner, Container, FormGroup, Col, Label, Input, Row, Jumbotron, Card, CardDeck, CardTitle, CardText, Button } from 'reactstrap';

import UserGrants from './user/UserGrants';
import GrantDetail from './grant/GrantDetail';

import { useUser } from '../hooks/useUser';

function MyGrants(props) {
	const { user, loading } = useUser();
	const { path } = useRouteMatch();
	const history = useHistory();

	if (loading === true) {
		return <Container className="text-center"><Spinner/></Container>
	} else if (user._id) {
		return (
			<Switch>
				<Route exact path={path}>
					<Fade>
						<Jumbotron>
							<h1>Profil</h1>
							<Row form>
								<FormGroup>
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
										<Label for="role">Rola:</Label>
										<Input id="role" plaintext readOnly value={user.role} />
									</Col>
								</FormGroup>
								<FormGroup>
									<Col>
										<Label for="devices">Prihlásené zariadenia:</Label>
										<Input id="devices" plaintext readOnly value={user.tokens.length} />
									</Col>
								</FormGroup>
								<FormGroup>
									<Col>
										<Label for="hoursTotal">Hodiny za rok {new Date().getFullYear()}:</Label>
										<h3 id="hoursTotal">{user.hoursTotal}</h3>
									</Col>
								</FormGroup>
							</Row>
							<hr />
							{"_id" in user.grants[0] && <UserGrants data={user} />}
							<Container>
								<Button onClick={() => history.push("/")} outline color="primary">Späť</Button>
							</Container>
						</Jumbotron>
					</Fade>
				</Route>
				<Route path={`${path}/:id`}>
					<GrantDetail />
				</Route>
			</Switch>
		);
	} else {
		return (
			<Container>
	    		<h1 className="text-center">Prosím prihláste sa</h1>
	    		{user.error && <Alert color="danger">{user.error}</Alert>}
			</Container>
		);
	}
}

export default MyGrants;