import React from "react";
import api from '../../../api';

import { ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form, FormGroup, FormFeedback, Label, Input, Alert } from "reactstrap";

import validateBudget from "../../../validation/validateBudget";
import useFormValidation from "../../../hooks/useFormValidation";

import { useUser } from '../../../hooks/useUser';

function EditBudget(props) {
	const { modal, setModal, getData } = props;
	const { accessToken } = useUser();

	const [ backendError, setBackendError ] = React.useState(null);	
	const [ backendMsg, setBackendMsg ] = React.useState(null);
	
	const INITIAL_STATE = {
		travel: modal.data.travel,
		material: modal.data.material,
		services: modal.data.services
	}

	const { handleSubmit, handleChange, handleBlur, values, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateBudget, editBudget);

	async function editBudget() {
		try {
	      const res = await api.put(
	        `grant/${modal.grant._id}/budget/${modal.data._id}`,
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
			<ModalHeader toggle={() => setModal(!modal)}>Upraviť rozpočet {new Date(modal.data.year).getFullYear()}</ModalHeader>
			<ModalBody>
		        <Row form className="justify-content-center">
		        	<Col>
			          <FormGroup>
		            	<Label for="travel" >Cestovné:</Label>
			            <Input 
			            	id="travel" 
			            	name="travel" 
			            	placeholder="Položka pre cestovné" 
			            	onBlur={handleBlur} 
			            	onChange={handleChange} 
			            	value={values.travel}
			            	invalid={errors.travel && true}
			                valid={valid.travel && true} 
			                autoComplete="off"
			            />
			            <FormFeedback invalid>{errors.travel}</FormFeedback>
		            	<FormFeedback valid>{valid.travel}</FormFeedback>
			          </FormGroup>
			        </Col>
		       	</Row>
		       	<Row form className="justify-content-center">
			        <Col>
			          <FormGroup>
			            <Label for="services" >Služby:</Label>
			            <Input 
			            	id="services" 
			            	name="services" 
			            	placeholder="Položka pre služby" 
			            	onBlur={handleBlur} 
			            	onChange={handleChange} 
			            	value={values.services}
			            	invalid={errors.services && true}
			                valid={valid.services && true} 
			                autoComplete="off"
			            />
			          	<FormFeedback invalid>{errors.services}</FormFeedback>
			            <FormFeedback valid>{valid.services}</FormFeedback>
			          </FormGroup>
			        </Col>
		        </Row>
		        <Row form className="justify-content-center">
			        <Col>
			          <FormGroup>
			            <Label for="material" >Materiál:</Label>
			            <Input 
			            	id="material" 
			            	name="material" 
			            	placeholder="Položka pre materiál" 
			            	onBlur={handleBlur} 
			            	onChange={handleChange} 
			            	value={values.material}
			            	invalid={errors.material && true}
			                valid={valid.material && true} 
			                autoComplete="off"
			            />
			          	<FormFeedback invalid>{errors.material}</FormFeedback>
			            <FormFeedback valid>{valid.material}</FormFeedback>
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
				<Button type="submit" color="warning" disabled={isSubmitting}>Upraviť</Button>{' '}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default EditBudget;