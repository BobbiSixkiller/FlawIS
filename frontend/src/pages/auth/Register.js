import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import api from "../../api";

import {
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

import { AuthContext } from "../../context/auth";
import useFormValidation from "../../hooks/useFormValidation";
import { validateRegister } from "../../util/validation";

const INITIAL_STATE = {
	email: "",
	password: "",
	repeatPass: "",
	firstName: "",
	lastName: "",
};

function Register() {
	const context = useContext(AuthContext);
	const history = useHistory();

	async function Register() {
		try {
			const res = await api.post("user/register", values);
			context.login(res.data);
			history.push("/");
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
	} = useFormValidation(INITIAL_STATE, validateRegister, Register);

	return (
		<Fade>
			<h1 className="text-center">Registrácia</h1>
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
							placeholder="Vaše krstné meno"
						/>
						<FormFeedback invalid>{errors.firstName}</FormFeedback>
						<FormFeedback valid>{valid.firstName}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="email">Priezvisko:</Label>
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
							placeholder="Vaše priezvisko"
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
							placeholder="Zvoľte heslo"
							autoComplete="off"
						/>
						<FormFeedback invalid>{errors.password}</FormFeedback>
						<FormFeedback valid>{valid.password}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="repeatPass">Zopakujte heslo:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="repeatPass"
							type="password"
							id="repeatPass"
							value={values.repeatPass}
							invalid={errors.repeatPass && true}
							valid={valid.repeatPass && true}
							placeholder="Pre potvrdenie zopakujte heslo"
							autoComplete="off"
						/>
						<FormFeedback invalid>{errors.repeatPass}</FormFeedback>
						<FormFeedback valid>{valid.repeatPass}</FormFeedback>
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
							Registrovať
						</Button>
					</Col>
				</FormGroup>
			</Form>
		</Fade>
	);
}

export default Register;
