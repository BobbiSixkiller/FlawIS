import React from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import {
	Jumbotron,
	Fade,
	Col,
	Row,
	Label,
	Input,
	FormGroup,
	Button,
	Container,
	Spinner,
} from "reactstrap";

import UserGrants from "./UserGrants";

import useAPI from "../../hooks/useAPI";
import { useUser } from "../../hooks/useUser";

function User() {
	const history = useHistory();
	const url = useParams();
	const { user, accessToken } = useUser();

	const [year, setYear] = React.useState(new Date().getFullYear());
	const [hours, setHours] = React.useState();

	const result = useAPI(`user/${url.id}`, "GET", accessToken);
	console.log(result);

	if (!user._id || user.role === "basic") {
		return <Redirect to={{ path: "/" }} />;
	} else if (Object.keys(result).length === 0) {
		return (
			<Container className="text-center">
				<Spinner />
			</Container>
		);
	} else {
		return (
			<Fade>
				<Jumbotron>
					<h1 className="mb-5">Profil používateľa</h1>
					<Row form>
						<FormGroup>
							<Col>
								<Label for="full name">Meno:</Label>
								<Input
									plaintext
									readOnly
									value={result.firstName + " " + result.lastName}
								/>
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
					</Row>
					<Row form>
						<FormGroup>
							<Col>
								<Label for="year">Rok:</Label>
								<Input
									type="select"
									name="year"
									id="year"
									value={year}
									onChange={(e) => setYear(e.target.value)}
								>
									<option value={new Date().getFullYear()}>
										{new Date().getFullYear()}
									</option>
									<option value={new Date().getFullYear() + 1}>
										{new Date().getFullYear() + 1}
									</option>
									<option value={new Date().getFullYear() + 2}>
										{new Date().getFullYear() + 2}
									</option>
									<option value={new Date().getFullYear() + 3}>
										{new Date().getFullYear() + 3}
									</option>
									<option value={new Date().getFullYear() + 4}>
										{new Date().getFullYear() + 4}
									</option>
								</Input>
							</Col>
						</FormGroup>
						<FormGroup>
							<Col>
								<Label for="hoursTotal">Hodiny za rok {year}:</Label>
								<h3 id="hoursTotal">{hours}</h3>
							</Col>
						</FormGroup>
					</Row>
					<hr />
					<UserGrants user={url.id} year={year} setHours={setHours} />
				</Jumbotron>
				<Button onClick={() => history.goBack()} outline color="primary">
					Back
				</Button>
			</Fade>
		);
	}
}

export default User;
