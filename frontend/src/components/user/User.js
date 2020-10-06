import React from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { Jumbotron, Fade, Col, Row, Label, Input, FormGroup, Button, Container, Spinner } from "reactstrap";

import UserGrants from "./UserGrants";

import getUser from "../../hooks/useAPI";
import { useUser } from "../../hooks/useUser";

function User() {
	const history = useHistory();
	const url = useParams();
	const { user, accessToken } = useUser();

	const result = getUser(`user/${url.id}`, "GET", accessToken);

	if (!user._id || user.role === "basic") {
		return <Redirect to={{path: "/"}}/>
	} else if (Object.keys(result).length === 0) {
		return <Container className="text-center"><Spinner/></Container>
	} else {
		return(
			<Fade>
				<Jumbotron>
					<h1>Informácie o používateľovi</h1>	
					<Row form>
						<FormGroup>
							<Col>
								<Label for="full name">Meno:</Label>
								<Input plaintext readOnly value={result.firstName + ' ' + result.lastName} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="email">Email:</Label>
								<Input plaintext readOnly value={result.email} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="role">Rola:</Label>
								<Input plaintext readOnly value={result.role} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="devices">Prihlásené zariadenia:</Label>
								<Input plaintext readOnly value={result.tokens.length} />
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="hours">Hodiny za rok {new Date().getFullYear()}:</Label>
								<h3>{result.hoursTotal}</h3>
							</Col>
						</FormGroup>
					</Row>	
					{"_id" in result.grants[0] && 
						<>
							<hr />
							<UserGrants data={result}/>
						</>
					}	
				</Jumbotron>
				<Button onClick={() => history.goBack()} outline color="primary">Back</Button>
			</Fade>
		);
	}
}

export default User;