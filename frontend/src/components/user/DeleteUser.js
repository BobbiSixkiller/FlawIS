import React from "react";
import api from '../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form } from "reactstrap";

import { useUser } from '../../hooks/useUser';

function DeleteUser(props) {
	const { getData, modal, setModal } = props;
	const { accessToken } = useUser();
	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	async function deleteUser(e) {
		e.preventDefault();
		try {
			const res = await api.delete(
				`user/${modal.data._id}`,
        		{ 
		          headers: {
		            authToken: accessToken
		          } 
		        }
        	)
        	setBackendMsg(res.data.msg);
        	getData(accessToken);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	return(
		<Form onSubmit={deleteUser}>
			<ModalHeader toggle={() => setModal(!modal.show)}>Zmazať grant</ModalHeader>
			<ModalBody>
				<p>Potvrďte zmazanie používateľa:</p>
				<p className="font-weight-bold">{modal.data.firstName + " " + modal.data.lastName}</p>
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
				<Button outline color="secondary" onClick={() => setModal(!modal.show)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default DeleteUser;