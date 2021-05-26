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
} from "reactstrap";

import { useUser } from "../../../hooks/useUser";

function DeleteFile(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;

	const [backendError, setBackendError] = React.useState(null);
	const [backendMsg, setBackendMsg] = React.useState(null);

	async function deleteFile(token, e) {
		e.preventDefault();
		try {
			const res = await api.delete(
				`grant/${modal.grant._id}/file/${modal.file._id}`,
				{
					headers: {
						authorization: token,
					},
				}
			);
			setBackendMsg(res.data.msg);
			getData(token);
		} catch (err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	return (
		<Form onSubmit={(e) => deleteFile(accessToken, e)}>
			<ModalHeader toggle={() => setModal(!modal)}>Zmazať dokument</ModalHeader>
			<ModalBody>
				<p>Potvrďte zmazanie dokumentu:</p>
				<p className="font-weight-bold">{modal.file.name}</p>
				{backendError && (
					<Row row className="justify-content-center">
						<Col>
							<Alert color="danger">
								{backendError}
								<Button close onClick={() => setBackendError(null)} />
							</Alert>
						</Col>
					</Row>
				)}
				{backendMsg && (
					<Row row className="justify-content-center">
						<Col>
							<Alert color="success">
								{backendMsg}
								<Button close onClick={() => setBackendMsg(null)} />
							</Alert>
						</Col>
					</Row>
				)}
			</ModalBody>
			<ModalFooter>
				<Button color="danger" type="submit">
					Zmazať
				</Button>{" "}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>
					Zrušiť
				</Button>
			</ModalFooter>
		</Form>
	);
}

export default DeleteFile;
