import React, { useState } from "react";
import API from "../../api";

import useFormSubmit from "../../hooks/useFormSubmit";
import useFormValidation from "../../hooks/useFormValidation";
import { validatePost } from "../../util/validation";

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

const INITIAL_STATE = {
	name: "",
	body: "",
	tags: [],
};

function AddPost(props) {
	const { modal, setModal, refresh } = props;

	const {
		handleInputChange,
		valueChangeCb,
		handleBlur,
		handleSubmit,
		hideRes,
		state: { loading, values, valid, errors, res },
	} = useFormSubmit(INITIAL_STATE, validatePost, "post/", "POST");

	console.log(values);
	// const [backendError, setBackendError] = useState(null);
	// const [backendMsg, setBackendMsg] = useState(null);
	// const [loading, setLoading] = useState(false);

	// const {
	// 	handleSubmit,
	// 	handleChange,
	// 	handleBlur,
	// 	values,
	// 	setValues,
	// 	errors,
	// 	valid,
	// 	isSubmitting,
	// } = useFormValidation(INITIAL_STATE, validatePost, newPost);

	// async function newPost() {
	// 	setLoading(true);
	// 	try {
	// 		const res = await API.post("post/", values);
	// 		setBackendMsg(res.data.msg);
	// 		setLoading(false);
	// 	} catch (err) {
	// 		setBackendError(err.response.data.error);
	// 		setLoading(false);
	// 	}
	// }

	return (
		<Form onSubmit={handleSubmit}>
			<ModalHeader
				toggle={() => {
					setModal(!modal);
					refresh();
				}}
			>
				Nový post
			</ModalHeader>
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
								onChange={handleInputChange}
								value={values.name}
								invalid={errors.name && errors.name.length > 0}
								valid={valid.name && valid.name.length > 0}
								autoComplete="off"
							/>
							<FormFeedback invalid="true">{errors.name}</FormFeedback>
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
								onChange={handleInputChange}
								value={values.body}
								invalid={errors.body && errors.body.length > 0}
								valid={valid.body && valid.body.length > 0}
								autoComplete="off"
							/>
							<FormFeedback invalid="true">{errors.body}</FormFeedback>
							<FormFeedback valid>{valid.body}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<TagInput
					errors={errors}
					valid={valid}
					values={values.tags}
					valueChangeCb={valueChangeCb}
					handleBlur={handleBlur}
				/>
				{/* {backendMsg && (
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
				)} */}
				{res && (
					<Row row className="justify-content-center my-3">
						<Col>
							<Alert color="danger">
								{res}
								<Button close onClick={hideRes} />
							</Alert>
						</Col>
					</Row>
				)}
			</ModalBody>
			<ModalFooter>
				<Button type="submit" disabled={loading} color="success">
					Pridať
				</Button>{" "}
				<Button
					outline
					color="secondary"
					onClick={() => {
						setModal(!modal);
						refresh();
					}}
				>
					Zrušiť
				</Button>
			</ModalFooter>
		</Form>
	);
}

export default AddPost;
