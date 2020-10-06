import React from "react";
import api from '../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form } from "reactstrap";

import { useUser } from '../../hooks/useUser';

function DeleteUser(props) {
	const { accessToken } = useUser();
	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	async function deleteUser(e) {
		e.preventDefault();
		try {
			const res = await api.delete(
				`user/${props.userDelete.user._id}`,
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
		await props.setUserDelete({show: false});
		await props.setModal(!props.modal);
	}

	return(
		<Form onSubmit={deleteUser}>
			<ModalHeader toggle={toggle}>Zmazať grant</ModalHeader>
			<ModalBody>
				<p>Potvrďte zmazanie používateľa:</p>
				<p className="font-weight-bold">{props.userDelete.user.firstName + " " + props.userDelete.user.lastName}</p>
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

export default DeleteUser;