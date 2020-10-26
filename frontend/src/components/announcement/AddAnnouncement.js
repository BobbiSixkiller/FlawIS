import React from 'react';
import { useHistory } from 'react-router-dom';
import api from '../../api';

import { Fade, Form, FormGroup, FormFeedback, Button, Label, Input, Col, Row, Alert } from 'reactstrap';

import { useUser } from '../../hooks/useUser';
import useFormValidation from "../../hooks/useFormValidation";
import validateAnnouncement from "../../validation/validateAnnouncement";

function AddAnnouncement(props) {
	const { getData } = props;
	const { user, accessToken } = useUser();

	const INITIAL_STATE = {
		name: "",
		content: "",
		issuedBy: user._id,
		type: "APVV"
	}

	const history = useHistory();
	const { handleSubmit, handleChange, handleBlur, values, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateAnnouncement, addAnnouncement);
  	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);
	const [ files, setFiles ] = React.useState([]);

  	async function addAnnouncement() {
		try {
			const res = await api.post("announcement/mass",
				values,
        		{ 
		          headers: {
					//'Content-type': 'multipart/form-data',
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

	async function handleFilesChange(e) {
		await setFiles(e.target.files);
		console.log(files);
	}

	return(
		<Fade>
	      <h1 className="text-center">Nový oznam</h1>
	      <Form onSubmit={handleSubmit}>
	      	<FormGroup row className="justify-content-center">
	          <Col sm={6}>
	        		<Label for="type">Typ grantu:</Label>
	        		<Input type="select" name="type" id="type" value={values.type} onChange={handleChange}>
						<option value={"APVV"}>APVV</option>
						<option value={"VEGA"}>VEGA</option>
						<option value={"KEGA"}>KEGA</option>
						<option value={"ALL"}>Všetky</option>
			        </Input>
	          </Col>
	        </FormGroup>
	        <FormGroup row className="justify-content-center">
	          <Col sm={6}>
	            <Label for="name">Názov oznamu:</Label>
	            <Input
	              onChange={handleChange}
	              onBlur={handleBlur}
	              name="name"
	              type="text"
	              id="name"
	              value={values.name}
	              invalid={errors.name && true}
	              valid={valid.name && true}
	              autoComplete="off"
	              placeholder="Názov oznamu"
	            />
	            <FormFeedback invalid>{errors.name}</FormFeedback>
	            <FormFeedback valid>{valid.name}</FormFeedback>
	          </Col>
	        </FormGroup>
	        <FormGroup row className="justify-content-center">
	          <Col sm={6}>
	            <Label for="content">Obsah oznamu:</Label>
	            <Input
	              onChange={handleChange}
	              onBlur={handleBlur}
	              name="content"
	              type="textarea"
	              id="content"
	              value={values.content}
	              invalid={errors.content && true}
	              valid={valid.content && true}
	              autoComplete="off"
	              placeholder="Obsah oznamu..."
	            />
	            <FormFeedback invalid>{errors.content}</FormFeedback>
	            <FormFeedback valid>{valid.content}</FormFeedback>
	          </Col>
	        </FormGroup>
	        {backendMsg && 
	          <FormGroup row className="justify-content-center">
	            <Col sm={6}>
	              <Alert color="success">{backendMsg}<Button close onClick={() => setBackendMsg(null)} /></Alert>
	            </Col>
	          </FormGroup>
	        }
	        {backendError && 
	          <FormGroup row className="justify-content-center">
	            <Col sm={6}>
	              <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
	            </Col>
	          </FormGroup>
	        }
	        <FormGroup row className="justify-content-center">
	          <Col sm={6}>
	            <Row className="justify-content-between">
	              <Button className="ml-3" outline color="primary" onClick={() => history.goBack()}>Späť</Button>
	              <Button className="mr-3" color="success" disabled={isSubmitting} type="submit">Pridať</Button>
	            </Row>
	          </Col>
	        </FormGroup>
	      </Form>
    </Fade>
	);
}

export default AddAnnouncement;