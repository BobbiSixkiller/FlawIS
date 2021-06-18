import React, { useContext, useState, useEffect } from "react";
import { Route, Switch, useRouteMatch, useHistory } from "react-router-dom";

import API from "../api";
import { AuthContext } from "../context/auth";

import {
	Fade,
	Alert,
	Spinner,
	Container,
	FormGroup,
	Col,
	Label,
	Input,
	Row,
	Jumbotron,
	Card,
	CardDeck,
	CardText,
	Button,
} from "reactstrap";

export default function Profile() {
	const context = useContext(AuthContext);
	const { path, url } = useRouteMatch();
	const history = useHistory();

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function currentUser() {
			try {
				setLoading(true);
				const res = await API.get("user/me");
				context.login(res.data);
				setLoading(false);
			} catch (error) {
				console.log(error.response);
				setLoading(false);
			}
		}

		currentUser();
	}, []);

	if (loading === true) {
		return (
			<Container className="text-center">
				<Spinner />
			</Container>
		);
	} else {
		return (
			<Switch>
				<Route exact path={path}>
					<Fade>
						{context.msg && (
							<Row>
								<Col className="my-5">
									<Alert className="text-center" color="primary">
										{context.msg}
										<Button close onClick={() => context.hideMsg()} />
									</Alert>
								</Col>
							</Row>
						)}
						<Jumbotron>
							<h1 className="text-center">Profil</h1>
							<Row form className="justify-content-center">
								<FormGroup row>
									<Col>
										<Label for="full-name">Meno:</Label>
										<Input
											id="full-name"
											plaintext
											readOnly
											value={context.user.fullName}
										/>
									</Col>
								</FormGroup>
								<FormGroup>
									<Col>
										<Label for="email">Email:</Label>
										<Input
											id="email"
											plaintext
											readOnly
											value={context.user.email}
										/>
									</Col>
								</FormGroup>
								<FormGroup>
									<Col>
										<Label for="created">Dátum registrácie:</Label>
										<Input
											id="created"
											plaintext
											readOnly
											value={new Date(context.user.createdAt).toLocaleString()}
										/>
									</Col>
								</FormGroup>
								<FormGroup>
									<Col>
										<Label for="modiffied">Dátum poslednej zmeny:</Label>
										<Input
											id="modiffied"
											plaintext
											readOnly
											value={new Date(context.user.updatedAt).toLocaleString()}
										/>
									</Col>
								</FormGroup>
							</Row>
							<hr />
							<CardDeck>
								<Card body inverse color="primary">
									<h5 className="card-title">Moje Granty</h5>
									<CardText>
										Modul poskytuje informácie ohľadne rozpočtu a hodín
										alokovaných v príslušných grantoch, v ktorých ste zapojený.
									</CardText>
									<Button
										color="info"
										onClick={() => history.push("/mygrants")}
									>
										Zobraziť
									</Button>
								</Card>
								<Card body inverse color="danger">
									<h5 className="card-title">Nástenka</h5>
									<CardText>
										Modul poskytuje informácie ohľadne vedeckej práce
										pedagogických pracovníkov fakulty
									</CardText>
									<Button color="info" onClick={() => history.push("/posts")}>
										Zobraziť
									</Button>
								</Card>
							</CardDeck>
						</Jumbotron>
					</Fade>
				</Route>
				<Route path={`${path}/mygrants`}></Route>
				<Route path={`${path}/posts`}></Route>
			</Switch>
		);
	}
}
