import React from "react";

import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validateAnnouncement } from "../../util/validation";

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
  FormText,
  Label,
  Input,
  CustomInput,
} from "reactstrap";

export default function AddAnnouncement({ toggle, grant }) {
  const INITIAL_STATE = {
    name: "",
    content: "",
    type: "SINGLE",
    files: {},
  };
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const { handleChange, handleBlur, handleSubmit, values, errors, valid } =
    useFormValidation(INITIAL_STATE, validateAnnouncement, addAnnouncement);

  function addAnnouncement() {
    let formData = new FormData();
    for (const key of Object.keys(values.files)) {
      formData.append("files", values.files[key]);
    }
    formData.append("name", values.name);
    formData.append("content", values.content);
    formData.append("type", values.type);

    sendData(`grant/${grant._id}/announcement`, "POST", formData, {
      "Content-type": "multipart/form-data",
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Pridať oznam</ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="name">Názov oznamu:</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Názov oznamu"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                invalid={errors.name && true}
                valid={valid.name && true}
                autoComplete="off"
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
                type="textarea"
                id="content"
                name="content"
                placeholder="Text oznamu..."
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.content}
                invalid={errors.content && true}
                valid={valid.content && true}
                autoComplete="off"
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
