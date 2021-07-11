import React, { useContext } from "react";

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

import { AuthContext } from "../../context/auth";
import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validateAnnouncement } from "../../util/validation";

export default function AddAnnouncement({ toggle }) {
  const { user } = useContext(AuthContext);

  const INITIAL_STATE = {
    name: "",
    content: "",
    type: "APVV",
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
    formData.append("type", values.type);

    sendData("announcement/", "POST", formData, {
      "Content-type": "multipart/form-data",
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Nový oznam</ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col>
            {" "}
            <FormGroup>
              <Label for="type">Typ grantu:</Label>
              <Input
                type="select"
                name="type"
                id="type"
                value={values.type}
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
              <FormFeedback invalid>{errors.name}</FormFeedback>
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
              <FormFeedback invalid>{errors.content}</FormFeedback>
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
                invalid={errors.files}
                valid={valid.files}
              >
                <FormFeedback invalid>{errors.files}</FormFeedback>
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
