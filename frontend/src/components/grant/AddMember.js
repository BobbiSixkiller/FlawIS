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

import UserApiSearch from "../user/UserApiSearch";

const INITIAL_STATE = {
  member: "",
  hours: "",
  role: "basic",
};

export default function AddMember({ toggle, modalData }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    setValues,
    errors,
    valid,
  } = useFormValidation(INITIAL_STATE, validateMember, addMember);

  async function addMember() {
    sendData(
      `grant/${modalData.grantId}/budget/${modalData.budget._id}`,
      "POST",
      values
    );
  }

  function memberInput(id) {
    setValues({ ...values, member: id });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Pridať nového riešiteľa</ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col sm={8}>
            {/* <AutoInput
              data={props.users}
              handleChange={handleChange}
              handleBlur={handleBlur}
              values={values}
              setValues={setValues}
              errors={errors}
              valid={valid}
            /> */}
            <Label>Riesitel</Label>
            <UserApiSearch
              memberInput={memberInput}
              errors={errors}
              valid={valid}
            />
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
          <Col>
            <CustomInput
              type="radio"
              id="basic"
              name="role"
              value="basic"
              label="Riešiteľ"
              inline
              defaultChecked
              onChange={handleChange}
            ></CustomInput>
            <CustomInput
              type="radio"
              id="deputy"
              name="role"
              value="deputy"
              label="Zástupca"
              inline
              onChange={handleChange}
            ></CustomInput>
            <CustomInput
              type="radio"
              id="leader"
              name="role"
              value="leader"
              label="Hlavný"
              inline
              onChange={handleChange}
            ></CustomInput>
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
        <Button color="success" type="submit" disabled={loading}>
          Pridať
        </Button>{" "}
        <Button outline color="secondary" onClick={toggle}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
