import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import API from "../../util/axiosConfig";

import { FormGroup, Button, Col, Spinner, Fade } from "reactstrap";

import TextInput from "../../components/form/TextInput";
import { userSchema } from "../../util/validation";

import { AuthContext } from "../../context/auth";
import { normalizeErrors } from "../../util/helperFunctions";

export default function Register() {
	const auth = useContext(AuthContext);
	const history = useHistory();

	return (
		<Fade>
			<h1 className="text-center">Registrácia</h1>
			<Formik
				initialValues={{
					email: "",
					password: "",
					repeatPass: "",
					firstName: "",
					lastName: "",
				}}
				validationSchema={userSchema}
				onSubmit={async (values, { setErrors }) => {
					try {
						const res = await API.post("user/register", values);
						auth.dispatch({ type: "SUCCESS", payload: res.data });
						history.push("/dashboard");
					} catch (err) {
						setErrors(normalizeErrors(err.response.data.errors));
						auth.dispatch({ type: "FAILURE", payload: err.response.data });
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form autoComplete="off">
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<TextInput
									type="email"
									name="email"
									placeholder="Email adresa..."
									label="Email"
								/>
							</Col>
						</FormGroup>
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<TextInput
									type="text"
									name="firstName"
									placeholder="Krstné meno..."
									label="Krstné meno"
								/>
							</Col>
						</FormGroup>
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<TextInput
									type="text"
									name="lastName"
									placeholder="Priezvisko..."
									label="Priezvisko"
								/>
							</Col>
						</FormGroup>
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<TextInput
									type="password"
									name="password"
									placeholder="Heslo..."
									label="Heslo"
								/>
							</Col>
						</FormGroup>
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<TextInput
									type="password"
									name="repeatPass"
									placeholder="Zopakujte heslo..."
									label="Heslo znovu"
								/>
							</Col>
						</FormGroup>
						{/* {auth.message && (
							<FormGroup row className="justify-content-center">
								<Col sm={6}>
									<Alert
										color={auth.error ? "danger" : "success"}
										show={auth.message}
										toggle={auth.hideMessage}
									>
										{auth.message}
									</Alert>
								</Col>
							</FormGroup>
						)} */}
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<Button
									block
									color="primary"
									disabled={isSubmitting}
									type="submit"
								>
									{isSubmitting ? (
										<Spinner size="sm" color="light" />
									) : (
										"Registrovať"
									)}
								</Button>
							</Col>
						</FormGroup>
					</Form>
				)}
			</Formik>
		</Fade>
	);
}
