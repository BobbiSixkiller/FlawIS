import React from "react";

import {
  Fade,
  Form,
  FormGroup,
  Col,
  FormFeedback,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
} from "reactstrap";

import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validateForgotPassword } from "../../util/validation";

const INITIAL_STATE = {
  email: "",
};

export default function ForgotPassword() {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const { handleSubmit, handleChange, handleBlur, values, errors, valid } =
    useFormValidation(INITIAL_STATE, validateForgotPassword, forgotPassword);

  function forgotPassword() {
    sendData("user/forgotPassword", "POST", values);
  }

  return (
    <Fade>
      <h1 className="text-center">Reset hesla</h1>
      <Form className="my-3" onSubmit={handleSubmit}>
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
              invalid={errors.email && true}
              valid={valid.email && true}
              autoComplete="off"
              placeholder="Vaša emailová adresa"
            />
            <FormFeedback invalid="true">{errors.email}</FormFeedback>
            <FormFeedback valid>{valid.email}</FormFeedback>
          </Col>
        </FormGroup>
        {data && (
          <FormGroup row className="justify-content-center">
            <Col sm={6}>
              <Alert color={error ? "danger" : "success"}>
                {data.msg}
                <Button close onClick={hideMessage} />
              </Alert>
            </Col>
          </FormGroup>
        )}
        <FormGroup row className="justify-content-center">
          <Col sm={6}>
            <Button block color="primary" disabled={loading} type="submit">
              {loading ? (
                <Spinner size="sm" color="light" />
              ) : (
                "Resetovať heslo"
              )}
            </Button>
          </Col>
        </FormGroup>
      </Form>
    </Fade>
  );
}
