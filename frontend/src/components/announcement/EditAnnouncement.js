import React from 'react';
import { useHistory } from 'react-router-dom';
import api from '../../api';

import { useUser } from '../../hooks/useUser';
import useFormValidation from "../../hooks/useFormValidation";
import validateAnnouncement from "../../validation/validateAnnouncement";

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form, FormGroup, FormFeedback, Label, Input, CustomInput } from "reactstrap";

function EditAnnouncement(props) {
	const { accessToken, user } = useUser();
	const { modal, setModal, getData } = props;
	const history = useHistory();

	const INITIAL_STATE = {
		name: modal.data.name,
		content: modal.data.content,
		issuedBy: user._id
	}

	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	const { handleSubmit, handleChange, handleBlur, values, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateAnnouncement, update);

	async function update() {
		try {
			const res = await api.put(`announcement/${modal.data._id}`,
				values,
				{ 
				  headers: {
				    authToken: accessToken
				  } 
				}
			);
			setBackendMsg(res.data.msg);
			getData(accessToken);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}
	
	return(
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={()=> setModal(!modal)}>Upraviť oznam</ModalHeader>
			<ModalBody>
				<Row form className="justify-content-center">
		        	<Col>
			          <FormGroup>
		            	<Label for="name">Názov:</Label>
			            <Input 
			            	type="text"
			            	id="name" 
			            	name="name" 
			            	placeholder="Názov oznamu" 
			            	onBlur={handleBlur} 
			            	onChange={handleChange} 
			            	value={values.name}
			            	invalid={errors.name && true}
			                valid={valid.name && true} 
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
		            	<Label for="content" >Oznam:</Label>
			            <Input 
			            	type="textarea"
			            	id="content" 
			            	name="content" 
			            	placeholder="Text oznamu..." 
			            	onBlur={handleBlur} 
			            	onChange={handleChange} 
			            	value={values.content}
			            	invalid={errors.content && true}
			                valid={valid.content && true} 
			                autoComplete="off"
			            />
			            <FormFeedback invalid>{errors.content}</FormFeedback>
		            	<FormFeedback valid>{valid.content}</FormFeedback>
			          </FormGroup>
			        </Col>
		       	</Row>
		       	{backendMsg && 
		        	<Row row className="justify-content-center my-3">
    		          <Col>
    		            <Alert color="success">{backendMsg}<Button close onClick={() => setBackendMsg(null)} /></Alert>
    		          </Col>
    		        </Row>
		       	}
		        {backendError && 
		        	<Row row className="justify-content-center my-3">
    		          <Col>
    		            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
    		          </Col>
    		        </Row>
		       	}
			</ModalBody>
			<ModalFooter>
				<Button type="submit" disabled={isSubmitting} color="warning">Upraviť</Button>{' '}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default EditAnnouncement;