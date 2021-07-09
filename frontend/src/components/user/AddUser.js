import React from "react";

import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validateRegister } from "../../util/validation";

import {
  Alert,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
} from "reactstrap";

const INITIAL_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  repeatPass: "",
  role: "basic",
};

export default function AddUser({ toggle }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const { handleChange, handleBlur, handleSubmit, values, errors, valid } =
    useFormValidation(INITIAL_STATE, validateRegister, addPost);

  function addPost() {
    sendData("user/", "POST", values);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Nový používateľ</ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="firstName">Krstné meno:</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Krstné meno"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                invalid={errors.firstName && errors.firstName.length > 0}
                valid={valid.firstName && valid.firstName.length > 0}
                autoComplete="off"
              />
              <FormFeedback invalid="true">{errors.firstName}</FormFeedback>
              <FormFeedback valid>{valid.firstName}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="lastName">Priezvisko:</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Priezvisko"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                invalid={errors.lastName && errors.lastName.length > 0}
                valid={valid.lastName && valid.lastName.length > 0}
                autoComplete="off"
              />
              <FormFeedback invalid="true">{errors.lastName}</FormFeedback>
              <FormFeedback valid>{valid.lastName}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <Label for="email">Email:</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.email}
            invalid={errors.email && errors.email.length > 0}
            valid={valid.email && valid.email.length > 0}
            autoComplete="off"
          />
          <FormFeedback invalid="true">{errors.email}</FormFeedback>
          <FormFeedback valid>{valid.email}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="password">Heslo:</Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="Heslo"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.password}
            invalid={errors.password && errors.password.length > 0}
            valid={valid.password && valid.password.length > 0}
            autoComplete="off"
          />
          <FormFeedback invalid="true">{errors.password}</FormFeedback>
          <FormFeedback valid>{valid.password}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="repeatPass">Zopakujte heslo:</Label>
          <Input
            type="password"
            id="repeatPass"
            name="repeatPass"
            placeholder="Heslo znova"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.repeatPass}
            invalid={errors.repeatPass && errors.repeatPass.length > 0}
            valid={valid.repeatPass && valid.repeatPass.length > 0}
            autoComplete="off"
          />
          <FormFeedback invalid="true">{errors.repeatPass}</FormFeedback>
          <FormFeedback valid>{valid.repeatPass}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="role">Rola:</Label>
          <Input
            type="select"
            id="role"
            name="role"
            onChange={handleChange}
            value={values.role}
            invalid={errors.role && errors.role.length > 0}
            valid={valid.role && valid.role.length > 0}
            autoComplete="off"
          >
            <option value="basic">Používateľ</option>
            <option value="admin">Administrátor</option>
            <option value="supervisor">Grantové oddelenie</option>
          </Input>
        </FormGroup>
        {data && (
          <Row className="justify-content-center my-3">
            <Col>
              <Alert color={error ? "danger" : "success"}>
                {data.msg}
                <Button close onClick={hideMessage} />
              </Alert>
            </Col>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="submit" disabled={loading} color="success">
          Pridať
        </Button>{" "}
        <Button outline color="secondary" onClick={toggle}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
