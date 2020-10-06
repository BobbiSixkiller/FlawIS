import React from 'react';
import api from '../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form } from "reactstrap";

import { useUser } from '../../hooks/useUser';

function DeleteAnnouncement(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;

	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	async function deleteAnnouncement(token, e) {
		e.preventDefault();
		try {
			const res = await api.delete(
				`announcement/${modal.data._id}`,
        		{ 
		          headers: {
		            authToken: token
		          } 
		        }
        	)
        	setBackendMsg(res.data.msg);
        	getData(accessToken);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	const issuedDate = new Date(modal.data.updatedAt).toLocaleDateString('sk-SK', options)

	return(
		<Form onSubmit={(e) => deleteAnnouncement(accessToken, e)}>
			<ModalHeader toggle={() => setModal(!modal)}>Zmazať oznam</ModalHeader>
			<ModalBody>
				<p>Potvrďte zmazanie oznamu:</p>
				<p className="font-weight-bold">{modal.data.name}</p>
				<p>Zverejnil: {modal.data.issuedBy ? (modal.data.issuedBy.fullName) : ("Používateľ bol zmazaný")}, {issuedDate}</p>
				{backendError && 
		        	<Row row className="justify-content-center">
			          <Col>
			            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
			          </Col>
			        </Row>
		       	}
		       	{backendMsg && 
		        	<Row row className="justify-content-center">
			          <Col>
			            <Alert color="success">{backendMsg}<Button close onClick={() => setBackendMsg(null)} /></Alert>
			          </Col>
			        </Row>
		       	}
			</ModalBody>
			<ModalFooter>
				<Button color="danger" type="submit">Zmazať</Button>{' '}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default DeleteAnnouncement;