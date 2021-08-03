import React from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";

import { Fade, FormGroup, Col, Alert, Button, Spinner } from "reactstrap";

import { useDataSend } from "../../hooks/useApi";
import TextInput from "../../components/form/TextInput";
import { resetPasswordSchema } from "../../util/validation";

function PasswordRedet() {
	const url = useParams();

	const { error, data, sendData, hideMessage } = useDataSend();

	return (
		<Fade>
			<h1 className="text-center">Reset hesla</h1>
			<Formik
				initialValues={{ password: "", repeatPass: "" }}
				validateSchema={resetPasswordSchema}
				onSubmit={(values, helpers) =>
					sendData(`user/reset/${url.token}`, "POST", values)
				}
			>
				{({ isSubmitting }) => (
					<Form autoComplete="off">
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<TextInput
									type="password"
									name="password"
									placeholder="Nové heslo..."
									label="Heslo"
								/>
							</Col>
						</FormGroup>
						<FormGroup row className="justify-content-center">
							<Col sm={6}>
								<TextInput
									type="password"
									name="repeatPass"
									placeholder="Nové heslo znova..."
									label="Zopakujte heslo"
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
									</Alert>
								</Col>
							</FormGroup>
						)}
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

export default PasswordRedet;
