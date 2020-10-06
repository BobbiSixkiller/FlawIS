import React from "react";
import api from '../../api';

import { Fade, Form, FormGroup, Col, FormFeedback, Label, Input, Button, Alert} from "reactstrap";

import useFormValidation from "../../hooks/useFormValidation";
import validateForgotPassword from "../../validation/validateForgotPassword";

const INITIAL_STATE = {
	email: ""
}

function ForgotPassword() {
	const forgotPassword = async () => {
		setLoading(true);
		try {
		  	const forgotPassword = await api.post(
		    	"user/forgotPassword",
		    	values
		  	);
		  	setBackendMsg(forgotPassword.data.msg);
		  	setLoading(false);
		} catch (err) {
		  	err.response.data.error && setBackendError(err.response.data.error);
		  	setLoading(false);
		}
	};

	const { handleSubmit, handleChange, handleBlur, values, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateForgotPassword, forgotPassword);
	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);
	const [ loading, setLoading ] = React.useState(false);

	return(
		<Fade>
	      <h1 className="text-center">Reset hesla</h1>
	      <Form className="my-3" onSubmit={handleSubmit}>
	        <FormGroup row className="justify-content-center">
	          <Col sm={6}>
	            <Label for="email" >Email:</Label>
	            <Input
	              onChange={handleChange}
	              onBlur={handleBlur}
	              name="email"
	              type="email"
	              id="email"
	              value={values.email}
	              invalid={errors.email && true}
	              valid={valid.email && true}
	              autoComplete="off"
	              placeholder="Vaša emailová adresa"
	            />
	            <FormFeedback invalid>{errors.email}</FormFeedback>
	            <FormFeedback valid>{valid.email}</FormFeedback>
	          </Col>
	        </FormGroup>
	        {backendError && 
	          <FormGroup row className="justify-content-center">
	            <Col sm={6}>
	              <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
	            </Col>
	          </FormGroup>
	        }
	        {backendMsg && 
	          <FormGroup row className="justify-content-center">
	            <Col sm={6}>
	              <Alert color="success">{backendMsg}<Button close onClick={() => setBackendMsg(null)} /></Alert>
	            </Col>
	          </FormGroup>
	        }
	        <FormGroup row className="justify-content-center">  
	          <Col sm={6}>
	            <Button block color="primary" disabled={loading} type="submit">Resetovať heslo</Button>
	          </Col>
	        </FormGroup>
	      </Form>
	    </Fade>
	);
}

export default ForgotPassword;