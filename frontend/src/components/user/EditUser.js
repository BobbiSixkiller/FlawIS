import React from "react";
import { useHistory, useParams } from "react-router-dom";
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
import validateUser from "../../validation/validateUserUpdate";

function EditUser(props) {
	const { form, getData } = props;
	const url = useParams();
	const history = useHistory();

	const { user, accessToken } = useUser();
	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);
	const [isOpen, setIsOpen] = React.useState(false);

	const INITIAL_STATE = {
		email: form.email,
		firstName: form.firstName,
		lastName: form.lastName,
		role: form.role,
	};

	async function Update() {
		try {
			const res = await api.put(`user/${url.id}`, values, {
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
	} = useFormValidation(INITIAL_STATE, validateUser, Update);

	let options = [];
	switch (values.role) {
		case "basic":
			options = ["basic", "supervisor", "admin"];
			break;
		case "supervisor":
			options = ["supervisor", "basic", "admin"];
			break;
		case "admin":
			options = ["admin", "basic", "supervisor"];
			break;
	}

	return (
		<Fade>
			<h1 className="text-center">Upraviť používateľa</h1>
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
							placeholder="Emailová addresa"
						/>
						<FormFeedback invalid>{errors.email}</FormFeedback>
						<FormFeedback valid>{valid.email}</FormFeedback>
					</Col>
				</FormGroup>
				{user.role === "admin" && (
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
								<option>{options[0]}</option>
								<option>{options[1]}</option>
								<option>{options[2]}</option>
							</Input>
						</Col>
					</FormGroup>
				)}
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
							placeholder="Priezvisko"
						/>
						<FormFeedback invalid>{errors.lastName}</FormFeedback>
						<FormFeedback valid>{valid.lastName}</FormFeedback>
					</Col>
				</FormGroup>
				{isOpen && (
					<>
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
									placeholder="Nové heslo"
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
					</>
				)}
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
						<Row form className="justify-content-between">
							<Button
								className="ml-1"
								outline
								color="primary"
								onClick={() => history.goBack()}
							>
								Späť
							</Button>
							<Button
								outline
								color="warning"
								onClick={() => setIsOpen(!isOpen)}
							>
								Zmena hesla
							</Button>
							<Button
								className="mr-1"
								color="success"
								disabled={isSubmitting}
								type="submit"
							>
								Upraviť
							</Button>
						</Row>
					</Col>
				</FormGroup>
			</Form>
		</Fade>
	);
}

export default EditUser;
