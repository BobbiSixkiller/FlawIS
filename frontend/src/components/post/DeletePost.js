import React from "react";
import API from "../../api";

import { useUser } from "../../hooks/useUser";

import {
	Alert,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Row,
	Col,
	Form,
} from "reactstrap";

function DeletePost(props) {
	const { modal, setModal, getData } = props;
	const { accessToken } = useUser();

	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);

	async function deletePost(e) {
		e.preventDefault();
		try {
			const res = await API.delete(`post/${modal.post._id}`, {
				headers: {
					authorization: accessToken,
				},
			});
			setBackendMsg(res.data.msg);
			getData();
		} catch (error) {
			console.log(error);
			setBackendError(error.error);
		}
	}

	return (
		<Form onSubmit={(e) => deletePost(e)}>
			<ModalHeader toggle={() => setModal(!modal)}>Zmazať post</ModalHeader>
			<ModalBody>
				<p>Potvrďte zmazanie postu:</p>
				<p className="font-weight-bold">{modal.post.name}</p>
				<p>
					Zverejnil: {modal.post.author},{" "}
					{new Date(modal.post.updatedAt).toLocaleDateString()}
				</p>
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
				<Button type="submit" color="danger">
					Zmazať
				</Button>{" "}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>
					Zrušiť
				</Button>
			</ModalFooter>
		</Form>
	);
}

export default DeletePost;
