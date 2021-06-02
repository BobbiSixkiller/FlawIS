import React from "react";
import API from "../../api";

import { useUser } from "../../hooks/useUser";
import useFormValidation from "../../hooks/useFormValidation";
import validatePost from "../../validation/validatePost";

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
} from "reactstrap";
import TagInput from "../TagInput";

function EditPost(props) {
	const { modal, setModal, getData } = props;
	const { accessToken } = useUser();

	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);

	const INITIAL_STATE = {
		name: modal.post.name,
		body: modal.post.body,
		tags: modal.post.tags,
	};

	const {
		handleSubmit,
		handleChange,
		handleBlur,
		setValues,
		values,
		errors,
		valid,
		isSubmitting,
	} = useFormValidation(INITIAL_STATE, validatePost, update);

	async function update(params) {
		try {
			const res = await API.put(`post/${modal.post._id}`, values, {
				headers: {
					authorization: accessToken,
				},
			});
			setBackendMsg(res.data.msg);
			getData();
		} catch (err) {
			console.log(err);
			setBackendError(err.response.data.error);
		}
	}

	return (
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={() => setModal(!modal)}>Upraviť post</ModalHeader>
			<ModalBody>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="name">Názov postu:</Label>
							<Input
								type="text"
								id="name"
								name="name"
								placeholder="Názov postu"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.name}
								invalid={errors.name}
								valid={valid.name}
								autoComplete="off"
							/>
							<FormFeedback invalid>{errors.name}</FormFeedback>
							<FormFeedback valid>{valid.name}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="body">Obsah:</Label>
							<Input
								type="textarea"
								id="body"
								name="body"
								placeholder="Text postu..."
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.body}
								invalid={errors.body}
								valid={valid.body}
								autoComplete="off"
							/>
							<FormFeedback invalid>{errors.body}</FormFeedback>
							<FormFeedback valid>{valid.body}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<TagInput
					errors={errors}
					valid={valid}
					values={values}
					setValues={setValues}
					handleBlur={handleBlur}
				/>
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
					Aktualizovať
				</Button>{" "}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>
					Zrušiť
				</Button>
			</ModalFooter>
		</Form>
	);
}

export default EditPost;
