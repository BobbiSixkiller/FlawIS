import React from "react";
import { useParams } from "react-router-dom";

import {
  Fade,
  Form,
  FormGroup,
  FormFeedback,
  Col,
  Alert,
  Button,
  Input,
  Label,
  Spinner,
} from "reactstrap";

import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validatePasswordReset } from "../../util/validation";

const INITIAL_STATE = {
  password: "",
  repeatPass: "",
};

function PasswordRedet() {
  const url = useParams();

  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const { handleSubmit, handleChange, handleBlur, values, errors, valid } =
    useFormValidation(INITIAL_STATE, validatePasswordReset, resetPassword);

  function resetPassword() {
    sendData(`user/reset/${url.token}`, "POST", values);
  }
  return (
    <Fade>
      <h1 className="text-center">Reset hesla</h1>
      <Form className="my-3" onSubmit={handleSubmit}>
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
              valid={valid.password && true}
              placeholder="Zvoľte heslo"
              autoComplete="off"
            />
            <FormFeedback invalid="true">{errors.password}</FormFeedback>
            <FormFeedback valid>{valid.password}</FormFeedback>
          </Col>
        </FormGroup>
        <FormGroup row className="justify-content-center">
          <Col sm={6}>
            <Label for="repeatPass">Zopakujte heslo:</Label>
            <Input
              onChange={handleChange}
              onBlur={handleBlur}
              name="repeatPass"
              type="password"
              id="repeatPass"
              value={values.repeatPass}
              invalid={errors.repeatPass && true}
              valid={valid.repeatPass && true}
              placeholder="Pre potvrdenie zopakujte heslo"
              autoComplete="off"
            />
            <FormFeedback invalid="true">{errors.repeatPass}</FormFeedback>
            <FormFeedback valid>{valid.repeatPass}</FormFeedback>
          </Col>
        </FormGroup>
        {data && (
          <FormGroup row className="justify-content-center">
            <Col sm={6}>
              <Alert
                color={error ? "danger" : "success"}
                show={data}
                toggle={hideMessage}
              >
                {data.message}
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

export default PasswordRedet;
