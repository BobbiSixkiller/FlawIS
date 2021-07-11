import React from "react";

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
  CustomInput,
} from "reactstrap";

import { validateMember } from "../../util/validation";
import useFormValidation from "../../hooks/useFormValidation";
import { useDataSend } from "../../hooks/useApi";

export default function EditMember({ toggle, modalData }) {
  const INITIAL_STATE = {
    hours: modalData.member.hours,
    active: modalData.member.active,
    role: modalData.member.role,
    member: modalData.member.member._id,
  };

  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    setValues,
    errors,
    valid,
  } = useFormValidation(INITIAL_STATE, validateMember, editMember);

  function editMember() {
    sendData(
      `grant/${modalData.grantId}/budget/${modalData.budget._id}/member/${modalData.member._id}`,
      "PUT",
      values
    );
  }
  function handleActiveChange(e) {
    setValues({ ...values, active: e.target.checked });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Upraviť riešiteľa</ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col sm={8}>
            <FormGroup>
              <Label for="member">Riešiteľ:</Label>
              <Input
                id="member"
                name="member"
                value={modalData.member.member.fullName}
                readOnly
                plaintext
              />
            </FormGroup>
          </Col>
          <Col sm={4}>
            <FormGroup>
              <Label for="hours">Hodiny:</Label>
              <Input
                id="hours"
                name="hours"
                placeholder="Hodiny"
                value={values.hours}
                onChange={handleChange}
                onBlur={handleBlur}
                valid={valid.hours && true}
                invalid={errors.hours && true}
                autoComplete="off"
              />
              <FormFeedback invalid>{errors.hours}</FormFeedback>
              <FormFeedback valid>{valid.hours}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col sm={8}>
            <CustomInput
              type="radio"
              id="basic"
              name="role"
              value="basic"
              label="Riešiteľ"
              inline
              defaultChecked={values.role === "basic" ? true : false}
              onChange={handleChange}
            />
            <CustomInput
              type="radio"
              id="deputy"
              name="role"
              value="deputy"
              label="Zástupca"
              inline
              defaultChecked={values.role === "deputy" ? true : false}
              onChange={handleChange}
            />
            <CustomInput
              type="radio"
              id="leader"
              name="role"
              value="leader"
              label="Hlavný"
              inline
              defaultChecked={values.role === "leader" ? true : false}
              onChange={handleChange}
            />
          </Col>
          <Col sm={4}>
            <FormGroup>
              <CustomInput
                type="switch"
                id="active"
                name="active"
                label="Active"
                defaultChecked={values.active}
                onChange={handleActiveChange}
              />
            </FormGroup>
          </Col>
        </Row>
        {data && (
          <Row row className="justify-content-center my-3">
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
        <Button type="submit" disabled={loading} color="warning">
          Upraviť
        </Button>{" "}
        <Button outline color="secondary" onClick={toggle}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
