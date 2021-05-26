import React from "react";
import { useHistory } from "react-router-dom";
import api from "../../api";

import {
	Fade,
	Form,
	FormText,
	CustomInput,
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
import validateAnnouncement from "../../validation/validateAnnouncement";

function AddAnnouncement(props) {
	const { user, accessToken } = useUser();
	const { getData } = props;

	const INITIAL_STATE = {
		name: "",
		content: "",
		issuedBy: user._id,
		type: "APVV",
		files: {},
	};

	const history = useHistory();
	const {
		handleSubmit,
		handleChange,
		handleBlur,
		values,
		errors,
		valid,
		isSubmitting,
	} = useFormValidation(INITIAL_STATE, validateAnnouncement, addAnnouncement);
	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);

	async function addAnnouncement() {
		try {
			let formData = new FormData();
			for (const key of Object.keys(values.files)) {
				formData.append("files", values.files[key]);
			}
			formData.append("name", values.name);
			formData.append("content", values.content);
			formData.append("issuedBy", values.issuedBy);
			formData.append("type", values.type);

			const res = await api.post("announcement/mass", formData, {
				headers: {
					"Content-type": "multipart/form-data",
					authorization: accessToken,
				},
			});
			setBackendMsg(res.data.msg);
			getData(accessToken);
		} catch (err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	return (
		<Fade>
			<h1 className="text-center">Nový oznam</h1>
			<Form onSubmit={handleSubmit}>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="type">Typ grantu:</Label>
						<Input
							type="select"
							name="type"
							id="type"
							value={values.type}
							onChange={handleChange}
						>
							<option value={"APVV"}>APVV</option>
							<option value={"VEGA"}>VEGA</option>
							<option value={"KEGA"}>KEGA</option>
							<option value={"ALL"}>Všetky</option>
						</Input>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="name">Názov oznamu:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="name"
							type="text"
							id="name"
							value={values.name}
							invalid={errors.name && true}
							valid={valid.name && true}
							autoComplete="off"
							placeholder="Názov oznamu"
						/>
						<FormFeedback invalid>{errors.name}</FormFeedback>
						<FormFeedback valid>{valid.name}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="content">Obsah oznamu:</Label>
						<Input
							onChange={handleChange}
							onBlur={handleBlur}
							name="content"
							type="textarea"
							id="content"
							value={values.content}
							invalid={errors.content && true}
							valid={valid.content && true}
							autoComplete="off"
							placeholder="Obsah oznamu..."
						/>
						<FormFeedback invalid>{errors.content}</FormFeedback>
						<FormFeedback valid>{valid.content}</FormFeedback>
					</Col>
				</FormGroup>
				<FormGroup row className="justify-content-center">
					<Col sm={6}>
						<Label for="files">Pripojiť dokument:</Label>
						<CustomInput
							type="file"
							id="files"
							name="files"
							label="Vyberte súbor nového dokumentu."
							onChange={handleChange}
							multiple
							invalid={errors.files}
							valid={valid.files}
						>
							<FormFeedback invalid>{errors.files}</FormFeedback>
							<FormFeedback valid>{valid.files}</FormFeedback>
						</CustomInput>
						<FormText color="muted">
							Maximálne je možné nahrať 5 súborov naraz!
						</FormText>
					</Col>
				</FormGroup>
				{backendMsg && (
					<FormGroup row className="justify-content-center">
						<Col sm={6}>
							<Alert color="success">
								{backendMsg}
								<Button close onClick={() => setBackendMsg(null)} />
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

export default AddAnnouncement;
