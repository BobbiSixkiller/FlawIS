import React, { useContext, useEffect } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";

import {
  NavLink,
  Form,
  FormGroup,
  FormFeedback,
  Button,
  Label,
  Input,
  Col,
  Alert,
  Fade,
} from "reactstrap";

import { AuthContext } from "../../context/auth";
import useFormValidation from "../../hooks/useFormValidation";
import { validateLogin } from "../../util/validation";

const INITIAL_STATE = {
  email: "",
  password: "",
};

function Login() {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const history = useHistory();

  let { from } = location.state || { from: { pathname: "/" } };

  function login() {
    auth.login(values);
  }

  const { handleSubmit, handleChange, handleBlur, values, errors, valid } =
    useFormValidation(INITIAL_STATE, validateLogin, login);

  useEffect(() => {
    console.log(auth.user);
    if (auth.user) {
      history.replace(from);
    }
  }, [auth.user]);

  return (
    <Fade>
      <Form className="my-3" onSubmit={handleSubmit}>
        <h1 className="text-center">Prihlásenie</h1>
        <FormGroup row className="justify-content-center">
          <Col sm={6}>
            <Label for="email">Email:</Label>
            <Input
              onChange={handleChange}
              onBlur={handleBlur}
              name="email"
              type="email"
              id="email"
              value={values.email}
              invalid={errors.email && errors.email.length > 0}
              valid={valid.email && valid.email.length > 0}
              autoComplete="off"
              placeholder="Vaša emailová adresa"
            />
            <FormFeedback invalid="true">{errors.email}</FormFeedback>
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
              invalid={errors.password && errors.password.length > 0}
              valid={valid.email && valid.email.length > 0}
              autoComplete="off"
              placeholder="Vaše heslo"
            />
            <FormFeedback invalid="true">{errors.password}</FormFeedback>
            <FormFeedback valid>{valid.password}</FormFeedback>
          </Col>
        </FormGroup>
        {auth.msg && (
          <FormGroup row className="justify-content-center">
            <Col sm={6}>
              <Alert color={auth.error ? "danger" : "success"}>
                {auth.msg}
                <Button close onClick={() => auth.hideMsg()} />
              </Alert>
            </Col>
          </FormGroup>
        )}
        <FormGroup row className="justify-content-center">
          <Col sm={6}>
            <Button block color="primary" disabled={auth.loading} type="submit">
              Prihlásiť
            </Button>
            <NavLink className="text-center" to="/forgotPassword" tag={Link}>
              Zabudli ste heslo ?
            </NavLink>
          </Col>
        </FormGroup>
      </Form>
    </Fade>
  );
}

export default Login;
