import React from "react";
import api from '../../api';
import { useHistory, Link } from "react-router-dom";

import { NavLink, Form, FormGroup, FormFeedback, Button, Label, Input, Col, Row, Alert, Fade } from 'reactstrap';

import { useUser } from '../../hooks/useUser';
import useFormValidation from "../../hooks/useFormValidation";
import validateLogin from "../../validation/validateLogin";

const INITIAL_STATE = {
  email: "",
  password: ""
}

function Login(props) {
  const { setAccessToken } = useUser();
  const history = useHistory();

  const login = async () => {
    try {
      const loginRes = await api.post(
        "user/login",
        values
      );
      setAccessToken(loginRes.data.token);
      history.push("/");
    } catch (err) {
      err.response.data.error && setBackendError(err.response.data.error);
    }
  };

  const { handleSubmit, handleChange, handleBlur, values, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateLogin, login);
  const [ backendError, setBackendError ] = React.useState(null);
  
  return (
    <Fade>
      <h1 className="text-center">Prihlásenie</h1>
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
        <FormGroup row className="justify-content-center">
          <Col sm={6}>
            <Label for="password">Heslo:</Label>
            <Input
              onChange={handleChange}
              onBlur={handleBlur}
              name="password"
              type="password"
              id="password"
              value={values.password}
              invalid={errors.password && true}
              valid={valid.email && true}
              autoComplete="off"
              placeholder="Vaše heslo"
            />
            <FormFeedback invalid>{errors.password}</FormFeedback>
            <FormFeedback valid>{valid.password}</FormFeedback>
          </Col> 
        </FormGroup>
        {backendError && 
          <FormGroup row className="justify-content-center">
            <Col sm={6}>
              <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
            </Col>
          </FormGroup>
        }
        <FormGroup row className="justify-content-center">  
          <Col sm={6}>
            <Button block color="primary" disabled={isSubmitting} type="submit">Prihlásiť</Button>
            <Link className="text-center" to="/forgotPassword"><NavLink>Zabudli ste heslo ?</NavLink></Link>
          </Col>
        </FormGroup>
      </Form>
    </Fade>
  );
}

export default Login;


