import React from "react";
import api from "../../../api";

import {
	Alert,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	FormFeedback,
	Label,
	Input,
	CustomInput,
} from "reactstrap";

import validateMember from "../../../validation/validateMember";
import useFormValidation from "../../../hooks/useFormValidation";
import { useUser } from "../../../hooks/useUser";

import AutoInput from "../../AutoInput";

const INITIAL_STATE = {
	member: "",
	hours: "",
	role: "basic",
};

function AddMember(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;

	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);

	const {
		handleSubmit,
		handleChange,
		handleBlur,
		values,
		setValues,
		errors,
		valid,
		isSubmitting,
	} = useFormValidation(INITIAL_STATE, validateMember, addMember);

	async function addMember() {
		try {
			const res = await api.post(
				`grant/${modal.grant._id}/budget/${modal.data._id}/addMember`,
				values,
				{
					headers: {
						authorization: accessToken,
					},
				}
			);
			setBackendMsg(res.data.msg);
			getData(accessToken);
		} catch (err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	return (
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={() => setModal(!modal)}>
				Pridať nového riešiteľa
			</ModalHeader>
			<ModalBody>
				<Row form className="justify-content-center">
					<Col sm={8}>
						<AutoInput
							data={props.users}
							handleChange={handleChange}
							handleBlur={handleBlur}
							values={values}
							setValues={setValues}
							errors={errors}
							valid={valid}
						/>
					</Col>
					<Col sm={4}>
						<FormGroup>
							<Label for="hours">Hodiny:</Label>
							<Input
								id="hours"
								name="hours"
								placeholder="Hodiny"
								value={values.hours}
								onChange={handleChange}
								onBlur={handleBlur}
								valid={valid.hours && true}
								invalid={errors.hours && true}
								autoComplete="off"
							/>
							<FormFeedback invalid>{errors.hours}</FormFeedback>
							<FormFeedback valid>{valid.hours}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<Row form className="justify-content-center">
					<Col>
						<CustomInput
							type="radio"
							id="basic"
							name="role"
							value="basic"
							label="Riešiteľ"
							inline
							defaultChecked
							onChange={handleChange}
						></CustomInput>
						<CustomInput
							type="radio"
							id="deputy"
							name="role"
							value="deputy"
							label="Zástupca"
							inline
							onChange={handleChange}
						></CustomInput>
						<CustomInput
							type="radio"
							id="leader"
							name="role"
							value="leader"
							label="Hlavný"
							inline
							onChange={handleChange}
						></CustomInput>
					</Col>
				</Row>
				{backendMsg && (
					<Row row className="justify-content-center my-3">
						<Col>
							<Alert color="success">
								{backendMsg}
								<Button close onClick={() => setBackendMsg(null)} />
							</Alert>
						</Col>
					</Row>
				)}
				{backendError && (
					<Row row className="justify-content-center my-3">
						<Col>
							<Alert color="danger">
								{backendError}
								<Button close onClick={() => setBackendError(null)} />
							</Alert>
						</Col>
					</Row>
				)}
			</ModalBody>
			<ModalFooter>
				<Button color="success" type="submit">
					Pridať
				</Button>{" "}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>
					Zrušiť
				</Button>
			</ModalFooter>
		</Form>
	);
}

export default AddMember;
