import React from "react";
import api from "../../api";
import { useHistory, useParams } from "react-router-dom";

import {
	Fade,
	Form,
	FormGroup,
	FormFeedback,
	Col,
	Alert,
	Button,
	Input,
	Label,
} from "reactstrap";

import useFormValidation from "../../hooks/useFormValidation";
import { validatePasswordReset } from "../../util/validation";

const INITIAL_STATE = {
	password: "",
	repeatPass: "",
};

function PasswordRedet() {
	const history = useHistory();
	const url = useParams();

	const resetPassword = async () => {
		setLoading(true);
		try {
			const reset = await api.post(`user/reset/${url.token}`, values);
			setLoading(false);
			setBackendMsg(reset.data.msg);
			setTimeout(() => history.push("/"), 2000);
		} catch (err) {
			err.response.data.error.message &&
				setBackendError(err.response.data.error.message);
			setLoading(false);
		}
	};

	const {
		handleSubmit,
		handleChange,
		handleBlur,
		values,
		errors,
		valid,
		isSubmitting,
	} = useFormValidation(INITIAL_STATE, validatePasswordReset, resetPassword);
	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);
	const [loading, setLoading] = React.useState(false);

	return (
		<Fade>
			<h1 className="text-center">Reset hesla</h1>
			<Form className="my-3" onSubmit={handleSubmit}>
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
				{backendMsg && (
					<FormGroup row className="justify-content-center">
						<Col sm={6}>
							<Alert color="success">
								{backendMsg}
								<Button close onClick={() => setBackendError(null)} />
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
						<Button block color="primary" disabled={loading} type="submit">
							Resetovať heslo
						</Button>
					</Col>
				</FormGroup>
			</Form>
		</Fade>
	);
}

export default PasswordRedet;
