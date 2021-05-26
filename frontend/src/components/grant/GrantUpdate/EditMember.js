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

function EditMember(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;

	const INITIAL_STATE = {
		hours: modal.data.hours,
		active: modal.data.active,
		role: modal.data.role,
		member: modal.data.member._id,
	};

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
	} = useFormValidation(INITIAL_STATE, validateMember, editMember);

	async function editMember() {
		try {
			const res = await api.put(
				`grant/${modal.grant._id}/budget/${modal.budget._id}/member/${modal.data._id}`,
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

	function handleActiveChange(e) {
		setValues({ ...values, active: e.target.checked });
	}

	return (
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={() => setModal(!modal)}>
				Upraviť riešiteľa
			</ModalHeader>
			<ModalBody>
				<Row form className="justify-content-center">
					<Col sm={8}>
						<FormGroup>
							<Label for="member">Riešiteľ:</Label>
							<Input
								id="member"
								name="member"
								value={modal.data.member.fullName}
								readOnly
								plaintext
								readOnly
							/>
						</FormGroup>
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
					<Col sm={8}>
						<CustomInput
							type="radio"
							id="basic"
							name="role"
							value="basic"
							label="Riešiteľ"
							inline
							defaultChecked={values.role === "basic" ? true : false}
							onChange={handleChange}
						/>
						<CustomInput
							type="radio"
							id="deputy"
							name="role"
							value="deputy"
							label="Zástupca"
							inline
							defaultChecked={values.role === "deputy" ? true : false}
							onChange={handleChange}
						/>
						<CustomInput
							type="radio"
							id="leader"
							name="role"
							value="leader"
							label="Hlavný"
							inline
							defaultChecked={values.role === "leader" ? true : false}
							onChange={handleChange}
						/>
					</Col>
					<Col sm={4}>
						<FormGroup>
							<CustomInput
								type="switch"
								id="active"
								name="active"
								label="Active"
								defaultChecked={values.active}
								onChange={handleActiveChange}
							/>
						</FormGroup>
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
				<Button type="submit" disabled={isSubmitting} color="warning">
					Upraviť
				</Button>{" "}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>
					Zrušiť
				</Button>
			</ModalFooter>
		</Form>
	);
}

export default EditMember;
