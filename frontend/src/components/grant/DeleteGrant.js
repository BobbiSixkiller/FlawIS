import React from "react";
import api from '../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form } from "reactstrap";

import { useUser } from '../../hooks/useUser';

function DeleteGrant(props) {
	const { accessToken } = useUser();
	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	async function deleteGrant(e) {
		e.preventDefault();
		try {
			const res = await api.delete(
				`grant/${props.grantDelete.grant._id}`,
        		{ 
		          headers: {
		            authToken: accessToken
		          } 
		        }
        	)
        	setBackendMsg(res.data.msg);
        	props.getData(accessToken);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	async function toggle() {
		await props.setGrantDelete({show: false});
		await props.setModal(!props.modal);
	}

	return(
		<Form onSubmit={deleteGrant}>
			<ModalHeader toggle={toggle}>Zmazať grant</ModalHeader>
			<ModalBody>
				<p>Potvrďte zmazanie grantu:</p>
				<p className="font-weight-bold">{props.grantDelete.grant.name}</p>
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
				<Button outline color="secondary" onClick={toggle}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default DeleteGrant;