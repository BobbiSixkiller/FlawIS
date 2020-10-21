import React from 'react';
import { useHistory, useRouteMatch, Redirect, Route, Switch } from "react-router-dom";
import { Fade, Alert, Spinner, Container, FormGroup, Col, Label, Input, Row, Jumbotron, Button } from 'reactstrap';

import UserGrants from './user/UserGrants';
import GrantDetail from './grant/GrantDetail';

import { useUser } from '../hooks/useUser';

function MyGrants() {
	const { user, accessToken, loading } = useUser();
	const { path } = useRouteMatch();
	const history = useHistory();

	const [ year, setYear ] = React.useState(new Date().getFullYear());
	const [ hours, setHours ] = React.useState();

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
							</Row>
							<Row form>
								<FormGroup>
									<Col>
										<Label for="year">Rok:</Label>
										<Input type="select" name="year" id="year" value={year} onChange={(e) => setYear(e.target.value)}>
											<option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
											<option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
											<option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
											<option value={new Date().getFullYear() + 3}>{new Date().getFullYear() + 3}</option>
											<option value={new Date().getFullYear() + 4}>{new Date().getFullYear() + 4}</option>
										</Input>
									</Col>
								</FormGroup>
								<FormGroup>
									<Col>
										<Label for="hoursTotal">Hodiny za rok {new Date().getFullYear()}:</Label>
										<h3 id="hoursTotal">{hours}</h3>
									</Col>
								</FormGroup>
							</Row>
							<hr />
							<UserGrants user={user._id} year={year} setHours={setHours} />
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