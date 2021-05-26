import React from "react";
import { useHistory } from "react-router-dom";
import api from "../../api";

import {
	Fade,
	Form,
	FormGroup,
	FormFeedback,
	Button,
	Label,
	Input,
	Col,
	Row,
	Alert,
} from "reactstrap";

import { useUser } from "../../hooks/useUser";
import useFormValidation from "../../hooks/useFormValidation";
import validateUser from "../../validation/validateRegister";

const INITIAL_STATE = {
	email: "",
	password: "",
	repeatPass: "",
	firstName: "",
	lastName: "",
	role: "basic",
};

function AddUser(props) {
	const { getData } = props;
	const { accessToken } = useUser();

	async function Register() {
		delete values.repeatPass;
		try {
			const res = await api.post("user/add", values, {
				headers: {
					authorization: accessToken,
				},
			});
			setBackendMsg(res.data.msg);
			getData(accessToken);
		} catch (err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	const {
		handleSubmit,
		handleChange,
		handleBlur,
		values,
		errors,
		valid,
		isSubmitting,
	} = useFormValidation(INITIAL_STATE, validateUser, Register);
	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);
	const history = useHistory();

	return (
		<Fade>
			<h1 className="text-center">Nový používateľ</h1>
			<Form onSubmit={handleSubmit}>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="email">Email:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="email"
							type="email"
							id="email"
							value={values.email}
							invalid={errors.email && true}
							valid={valid.email && true}
							autoComplete="off"
							placeholder="Emailová adresa"
						/>
						<FormFeedback invalid>{errors.email}</FormFeedback>
						<FormFeedback valid>{valid.email}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="role">Rola:</Label>
						<Input
							type="select"
							name="role"
							id="role"
							value={values.role}
							onChange={handleChange}
						>
							<option>basic</option>
							<option>supervisor</option>
							<option>admin</option>
						</Input>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="firstName">Krstné meno:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="firstName"
							type="text"
							id="firstName"
							value={values.firstName}
							invalid={errors.firstName && true}
							valid={valid.firstName && true}
							autoComplete="off"
							placeholder="Krstné meno"
						/>
						<FormFeedback invalid>{errors.firstName}</FormFeedback>
						<FormFeedback valid>{valid.firstName}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="lastName">Priezvisko:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="lastName"
							type="text"
							id="lastName"
							value={values.lastName}
							invalid={errors.lastName && true}
							valid={valid.lastName && true}
							autoComplete="off"
							placeholder="Priezvisko"
						/>
						<FormFeedback invalid>{errors.lastName}</FormFeedback>
						<FormFeedback valid>{valid.lastName}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="password">Heslo:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="password"
							type="password"
							id="password"
							value={values.password}
							invalid={errors.password && true}
							valid={valid.password && true}
							placeholder="Heslo"
							autoComplete="off"
						/>
						<FormFeedback invalid>{errors.password}</FormFeedback>
						<FormFeedback valid>{valid.password}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="repeatPass">Zopakovať heslo:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="repeatPass"
							type="password"
							id="repeatPass"
							value={values.repeatPass}
							invalid={errors.repeatPass && true}
							valid={valid.repeatPass && true}
							placeholder="Zopakujte heslo"
							autoComplete="off"
						/>
						<FormFeedback invalid>{errors.repeatPass}</FormFeedback>
						<FormFeedback valid>{valid.repeatPass}</FormFeedback>
					</Col>
				</FormGroup>
				{backendMsg && (
					<FormGroup row className="justify-content-center">
						<Col sm={6}>
							<Alert color="success">
								{backendMsg}
								<Button
									close
									onClick={() => {
										setBackendMsg(null);
										history.goBack();
									}}
								/>
							</Alert>
						</Col>
					</FormGroup>
				)}
				{backendError && (
					<FormGroup row className="justify-content-center">
						<Col sm={6}>
							<Alert color="danger">
								{backendError}
								<Button close onClick={() => setBackendError(null)} />
							</Alert>
						</Col>
					</FormGroup>
				)}
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Row className="justify-content-between">
							<Button
								className="ml-3"
								outline
								color="primary"
								onClick={() => history.goBack()}
							>
								Späť
							</Button>
							<Button
								className="mr-3"
								color="success"
								disabled={isSubmitting}
								type="submit"
							>
								Pridať
							</Button>
						</Row>
					</Col>
				</FormGroup>
			</Form>
		</Fade>
	);
}

export default AddUser;
