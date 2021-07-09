import React from "react";
import api from "../../../api";

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
  FormText,
  CustomInput,
} from "reactstrap";

import validateAnnouncement from "../../../validation/validateAnnouncement";
import useFormValidation from "../../../hooks/useFormValidation";
import { useUser } from "../../../hooks/useUser";

function AddAnnouncement(props) {
  const { user, accessToken } = useUser();
  const { setModal, modal, getData } = props;

  const INITIAL_STATE = {
    name: "",
    content: "",
    issuedBy: user._id,
    type: "SINGLE",
    files: {},
  };

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    errors,
    valid,
    isSubmitting,
  } = useFormValidation(INITIAL_STATE, validateAnnouncement, addAnnouncement);
  const [backendError, setBackendError] = React.useState(null);
  const [backendMsg, setBackendMsg] = React.useState(null);

  async function addAnnouncement() {
    try {
      let formData = new FormData();
      for (const key of Object.keys(values.files)) {
        formData.append("files", values.files[key]);
      }
      formData.append("name", values.name);
      formData.append("content", values.content);
      formData.append("type", values.type);

      const res = await api.post(
        `grant/${modal.data._id}/announcement`,
        formData,
        {
          headers: {
            "Content-type": "multipart/form-data",
            authorization: accessToken,
          },
        }
      );
      setBackendMsg(res.data.msg);
      getData(accessToken);
    } catch (err) {
      console.log(err);
      err.response.data.error && setBackendError(err.response.data.error);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={() => setModal(!modal)}>Pridať oznam</ModalHeader>
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
        {backendMsg && (
          <Row row className="justify-content-center my-3">
            <Col>
              <Alert color="success">
                {backendMsg}
                <Button close onClick={() => setBackendMsg(null)} />
              </Alert>
            </Col>
          </Row>
        )}
        {backendError && (
          <Row row className="justify-content-center my-3">
            <Col>
              <Alert color="danger">
                {backendError}
                <Button close onClick={() => setBackendError(null)} />
              </Alert>
            </Col>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="submit" disabled={isSubmitting} color="success">
          Pridať oznam
        </Button>{" "}
        <Button outline color="secondary" onClick={() => setModal(!modal)}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}

export default AddAnnouncement;
