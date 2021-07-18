import React, { useEffect } from "react";

import {
  Alert,
  ModalHeader,
  ModalBody,
  ModalFooter,
  NavLink,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  FormText,
  FormFeedback,
  Label,
  Input,
  CustomInput,
} from "reactstrap";
import { FileEarmark } from "react-bootstrap-icons";

import useModal from "../../hooks/useModal";
import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validateAnnouncement } from "../../util/validation";

import DeleteFile from "./DeleteFile";

export default function EditAnnouncement({ toggle, announcement, dispatch }) {
  const INITIAL_STATE = {
    name: announcement.name,
    content: announcement.content,
    files: {},
  };

  const { show, modalData, dispatch: nestedDispatch } = useModal(announcement);
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    setValues,
    errors,
    valid,
  } = useFormValidation(INITIAL_STATE, validateAnnouncement, update);

  function update() {
    const formData = new FormData();
    for (const key of Object.keys(values.files)) {
      formData.append("files", values.files[key]);
    }
    formData.append("name", values.name);
    formData.append("content", values.content);

    sendData(`announcement/${announcement._id}`, "PUT", formData, {
      "Content-type": "multipart/form-data",
    });
    setValues({ ...values, files: {} });
  }

  useEffect(() => {
    console.log(data);
    if (data && !error)
      dispatch({ type: "UPDATE_DATA", payload: data.announcement });
  }, [data, error, dispatch]);

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Upraviť oznam</ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="name">Názov:</Label>
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
              <FormFeedback invalid="true">{errors.name}</FormFeedback>
              <FormFeedback valid>{valid.name}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="content">Oznam:</Label>
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
        {announcement.files.map((file, key) => (
          <FormGroup key={key} className="mx-1" row>
            <Button
              tag={NavLink}
              target="_blank"
              href={file.url}
              outline
              color="primary"
            >
              <FileEarmark /> {file.name}
            </Button>
            <Button
              close
              onClick={() =>
                nestedDispatch({
                  type: "ACTION",
                  payload: { announcement, file },
                })
              }
              className="pl-1"
            />
          </FormGroup>
        ))}
        {data && (
          <Row className="justify-content-center my-3">
            <Col>
              <Alert
                color={error ? "danger" : "success"}
                isOpen={data}
                toggle={hideMessage}
              >
                {data.message}
                {data.errors && (
                  <>
                    <hr />
                    <ul>
                      {data.errors.map((e) => (
                        <li>{e}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Alert>
            </Col>
          </Row>
        )}
        <DeleteFile
          show={show}
          dispatch={dispatch}
          nestedDispatch={nestedDispatch}
          modalData={modalData}
        />
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
