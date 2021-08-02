import React from "react";
import { Formik, Form } from "formik";

import { Fade, FormGroup, Col, Button, Alert, Spinner } from "reactstrap";

import { useDataSend } from "../../hooks/useApi";
import TextInput from "../../components/form/TextInput";
import { forgotPasswordSchema } from "../../util/validation";

const INITIAL_STATE = {
	email: "",
};

export default function ForgotPassword() {
	const { loading, error, data, sendData, hideMessage } = useDataSend();

	return (
		<Fade>
			<h1 className="text-center">Reset hesla</h1>
			<Formik
				initialValues={{ email: "" }}
				validationSchema={forgotPasswordSchema}
				onSubmit={(values, helpers) =>
					sendData("user/forgotPassword", "POST", values)
				}
			>
				{() => (
					<Form>
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
						{data && (
							<FormGroup row className="justify-content-center">
								<Col sm={6}>
									<Alert
										color={error ? "danger" : "success"}
										show={data}
										toggle={hideMessage}
									>
										{data.message}
										{data.errors && (
											<>
												<hr />
												<ul>
													{data.errors.map((e) => (
														<li>{e}</li>
													))}
												</ul>
											</>
										)}
									</Alert>
								</Col>
							</FormGroup>
						)}
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<Button block color="primary" disabled={loading} type="submit">
									{loading ? (
										<Spinner size="sm" color="light" />
									) : (
										"Resetovať heslo"
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
