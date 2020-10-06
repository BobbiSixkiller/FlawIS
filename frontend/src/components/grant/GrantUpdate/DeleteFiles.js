import React from "react";
import api from '../../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form } from "reactstrap";

import { useUser } from '../../../hooks/useUser';

function DeleteFiles(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;
	
	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	async function deleteFiles(token, e) {
		e.preventDefault();
		try {
			const res = await api.delete(
				`grant/${modal.data._id}/files`,
        		{ 
		          headers: {
		            authToken: token
		          } 
		        }
        	);
        	setBackendMsg(res.data.msg);
        	getData(token);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	return(
		<Form onSubmit={(e) => deleteFiles(accessToken, e)}>
			<ModalHeader toggle={() => setModal(!modal)}>Zmazať dokumenty</ModalHeader>
			<ModalBody>
				<p>Potvrďte zmazanie <span className="font-weight-bold">{modal.data.files.length}</span> dokumentov.</p>
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
				<Button color="danger" type="submit" disabled={modal.data.files.length === 0}>Zmazať</Button>{' '}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default DeleteFiles;