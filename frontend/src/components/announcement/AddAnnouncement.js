import React from "react";

import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormText,
  CustomInput,
  FormGroup,
  FormFeedback,
  Button,
  Label,
  Input,
  Col,
  Row,
  Alert,
} from "reactstrap";

import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validateAnnouncement } from "../../util/validation";

export default function AddAnnouncement({ toggle, grantId }) {
  const INITIAL_STATE = {
    name: "",
    content: "",
    scope: grantId ? "SINGLE" : "APVV",
    files: {},
  };

  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const { handleSubmit, handleChange, handleBlur, values, errors, valid } =
    useFormValidation(INITIAL_STATE, validateAnnouncement, addAnnouncement);

  function addAnnouncement() {
    let formData = new FormData();
    for (const key of Object.keys(values.files)) {
      formData.append("files", values.files[key]);
    }
    formData.append("name", values.name);
    formData.append("content", values.content);
    formData.append("scope", values.scope);
    if (grantId) formData.append("grantId", grantId);

    sendData("announcement/", "POST", formData, {
      "Content-type": "multipart/form-data",
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Nový oznam</ModalHeader>
      <ModalBody>
        {!grantId && (
          <Row form className="justify-content-center">
            <Col>
              {" "}
              <FormGroup>
                <Label for="scope">Typ grantu:</Label>
                <Input
                  type="select"
                  name="scope"
                  id="scope"
                  value={values.scope}
                  onChange={handleChange}
                >
                  <option value={"APVV"}>APVV</option>
                  <option value={"VEGA"}>VEGA</option>
                  <option value={"KEGA"}>KEGA</option>
                  <option value={"ALL"}>Všetky</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        )}
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
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
              <FormFeedback invalid="true">{errors.name}</FormFeedback>
              <FormFeedback valid>{valid.name}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
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
              <FormFeedback invalid="true">{errors.content}</FormFeedback>
              <FormFeedback valid>{valid.content}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="files">Pripojiť dokument:</Label>
              <CustomInput
                type="file"
                id="files"
                name="files"
                label="Vyberte súbor nového dokumentu."
                onChange={handleChange}
                multiple
                invalid={errors.files && true}
                valid={valid.files && true}
              >
                <FormFeedback invalid="true">{errors.files}</FormFeedback>
                <FormFeedback valid>{valid.files}</FormFeedback>
              </CustomInput>
              <FormText color="muted">
                Maximálne je možné nahrať 5 súborov naraz!
              </FormText>
            </FormGroup>
          </Col>
        </Row>
        {data && (
          <Row className="justify-content-center my-3">
            <Col>
              <Alert color={error ? "danger" : "success"}>
                {error ? data.errors.map((e) => e) : data.message}
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
