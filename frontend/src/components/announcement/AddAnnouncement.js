import React from "react";
import { Formik, Form } from "formik";

import {
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Col,
	Row,
	Alert,
	Spinner,
} from "reactstrap";

import SelectInput from "../form/SelectInput";
import TextInput from "../form/TextInput";
import FileUpload from "../form/FileUpload";

import { useDataSend } from "../../hooks/useApi";
import { announcementSchema } from "../../util/validation";

export default function AddAnnouncement({ toggle, grantId }) {
	const { loading, error, data, sendData, hideMessage } = useDataSend();

	async function addAnnouncement(values) {
		let formData = new FormData();
		for (const key of Object.keys(values.files)) {
			formData.append("files", values.files[key]);
		}
		formData.append("name", values.name);
		formData.append("content", values.content);
		formData.append("scope", values.scope);
		if (grantId) formData.append("grantId", grantId);

		const res = await sendData("announcement/", "POST", formData, {
			"Content-type": "multipart/form-data",
		});

		return res;
	}

	return (
		<Formik
			initialValues={{
				name: "",
				content: "",
				scope: grantId ? "SINGLE" : "APVV",
				files: [],
			}}
			validationSchema={announcementSchema}
			onSubmit={async (values, helpers) => {
				console.log(values);
			}}
		>
			{({ values, errors, isSubmitting }) => (
				<Form autoComplete="off">
					<ModalHeader toggle={toggle}>Nový oznam</ModalHeader>
					<ModalBody>
						{!grantId && (
							<Row form className="justify-content-center">
								<Col>
									<SelectInput
										name="scope"
										label="Typ oznamu"
										options={[
											{ value: "APVV", name: "APVV" },
											{ value: "VEGA", name: "VEGA" },
											{ value: "KEGA", name: "KEGA" },
											{ value: "ALL", name: "Všetky" },
										]}
									/>
								</Col>
							</Row>
						)}
						<Row form className="justify-content-center">
							<Col>
								<TextInput
									type="text"
									name="name"
									label="Názov oznamu"
									placeholder="Názov oznamu..."
								/>
							</Col>
						</Row>
						<Row form className="justify-content-center">
							<Col>
								<TextInput
									type="textarea"
									name="content"
									label="Obsah oznamu"
									placeholder="Obsah oznamu..."
								/>
							</Col>
						</Row>
						<Row form className="justify-content-center">
							<Col>
								{/* <FormGroup>
                  <Label for="files">Pripojiť dokument:</Label>
                  <CustomInput
                    type="file"
                    id="files"
                    name="files"
                    label="Vyberte súbor nového dokumentu."
                    onChange={handleChange}
                    multiple
                    invalid={errors.files && true}
                    valid={valid.files && true}
                  >
                    <FormFeedback invalid="true">{errors.files}</FormFeedback>
                    <FormFeedback valid>{valid.files}</FormFeedback>
                  </CustomInput>
                  <FormText color="muted">
                    Maximálne je možné nahrať 5 súborov naraz!
                  </FormText>
                </FormGroup> */}
								<FileUpload name="files" label="Dokumenty" />
							</Col>
						</Row>
						{data && (
							<Row className="justify-content-center my-3">
								<Col>
									<Alert
										color={error ? "danger" : "success"}
										isOpen={data}
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
							</Row>
						)}
					</ModalBody>
					<ModalFooter>
						<Button type="submit" disabled={isSubmitting} color="success">
							{isSubmitting ? <Spinner size="sm" color7="light" /> : "Pridať"}
						</Button>{" "}
						<Button outline color="secondary" onClick={toggle}>
							Zrušiť
						</Button>
					</ModalFooter>
				</Form>
			)}
		</Formik>
	);
}
