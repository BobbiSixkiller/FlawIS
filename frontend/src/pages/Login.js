import React, { useContext, useState } from "react";
import api from "../api";
import { useLocation, useHistory, Link } from "react-router-dom";

import {
	NavLink,
	Form,
	FormGroup,
	FormFeedback,
	Button,
	Label,
	Input,
	Col,
	Alert,
	Fade,
} from "reactstrap";

import { AuthContext } from "../context/auth";
import useFormValidation from "../hooks/useFormValidation";
import validateLogin from "../validation/validateLogin";

const INITIAL_STATE = {
	email: "",
	password: "",
};

function Login() {
	const context = useContext(AuthContext);
	const location = useLocation();
	const history = useHistory();

	let { from } = location.state || { from: { pathname: "/" } };

	async function login() {
		try {
			const res = await api.post("user/login", values);
			//context.login(res.data);
			history.replace(from);
		} catch (err) {
			context.login(err.response.data);
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
	} = useFormValidation(INITIAL_STATE, validateLogin, login);

	return (
		<Fade>
			<h1 className="text-center">Prihlásenie</h1>
			<Form className="my-3" onSubmit={handleSubmit}>
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
							placeholder="Vaša emailová adresa"
						/>
						<FormFeedback invalid>{errors.email}</FormFeedback>
						<FormFeedback valid>{valid.email}</FormFeedback>
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
							valid={valid.email && true}
							autoComplete="off"
							placeholder="Vaše heslo"
						/>
						<FormFeedback invalid>{errors.password}</FormFeedback>
						<FormFeedback valid>{valid.password}</FormFeedback>
					</Col>
				</FormGroup>
				{context.error && (
					<FormGroup row className="justify-content-center">
						<Col sm={6}>
							<Alert color="danger">
								{context.error}
								<Button close onClick={() => context.hideError()} />
							</Alert>
						</Col>
					</FormGroup>
				)}
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Button block color="primary" disabled={isSubmitting} type="submit">
							Prihlásiť
						</Button>
						<Link className="text-center" to="/forgotPassword">
							<NavLink>Zabudli ste heslo ?</NavLink>
						</Link>
					</Col>
				</FormGroup>
			</Form>
		</Fade>
	);
}

export default Login;
