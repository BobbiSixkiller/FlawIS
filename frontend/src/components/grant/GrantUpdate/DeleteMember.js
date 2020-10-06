import React from 'react';
import api from '../../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form } from "reactstrap";

import { useUser } from '../../../hooks/useUser';

function DeleteMember(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;

	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	async function DeleteMember(token, e) {
		e.preventDefault();
		try {
			const res = await api.delete(
				`grant/${modal.grant._id}/budget/${modal.budget._id}/member/${modal.data._id}`,
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

	return(
		<Form onSubmit={(e) => DeleteMember(accessToken, e)}>
			<ModalHeader toggle={() => setModal(!modal)}>Odobrať riešiteľa</ModalHeader>
			<ModalBody>
				<p>Potvrďte odobratie riešiteľa:</p>
				<p className="font-weight-bold">{modal.data.member.fullName}</p>
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
				<Button color="danger" type="submit">Odobrať</Button>{' '}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default DeleteMember;