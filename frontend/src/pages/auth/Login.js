import React, { useContext, useEffect } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { Formik, Form } from "formik";

import {
  NavLink,
  FormGroup,
  Button,
  Col,
  Alert,
  Fade,
  Spinner,
} from "reactstrap";

import TextInput from "../../components/form/TextInput";
import { loginSchema } from "../../util/validation";

import { AuthContext } from "../../context/auth";

export default function Login() {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const history = useHistory();

  let { from } = location.state || { from: { pathname: "/dashboard" } };

  useEffect(() => {
    console.log(auth.user);
    if (auth.user) {
      history.replace(from);
    }
  }, [auth.user, history, from]);

  return (
    <Fade>
      <h1 className="text-center">Prihlásenie</h1>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values, { resetForm }) => {
          const res = await auth.login(values);
          if (!res.success) {
            resetForm({ values });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormGroup row className="justify-content-center">
              <Col sm={6}>
                <TextInput
                  type="email"
                  name="email"
                  placeholder="Email adresa..."
                  label="Email"
                />
              </Col>
            </FormGroup>
            <FormGroup row className="justify-content-center">
              <Col sm={6}>
                <TextInput
                  type="password"
                  name="password"
                  placeholder="Heslo..."
                  label="Heslo"
                />
              </Col>
            </FormGroup>
            {auth.message && (
              <FormGroup row className="justify-content-center">
                <Col sm={6}>
                  <Alert
                    color={auth.error ? "danger" : "success"}
                    show={auth.message}
                    toggle={auth.hideMessage}
                  >
                    {auth.message}
                  </Alert>
                </Col>
              </FormGroup>
            )}
            <FormGroup row className="justify-content-center">
              <Col sm={6}>
                <Button
                  block
                  color="primary"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="light" />
                  ) : (
                    "Prihlásiť"
                  )}
                </Button>
                <NavLink
                  className="text-center"
                  to="/forgotPassword"
                  tag={Link}
                >
                  Zabudli ste heslo ?
                </NavLink>
              </Col>
            </FormGroup>
          </Form>
        )}
      </Formik>
    </Fade>
  );
}
