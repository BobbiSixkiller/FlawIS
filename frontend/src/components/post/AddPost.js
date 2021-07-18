import React from "react";

import { useDataSend } from "../../hooks/useApi";
import useFormValidation from "../../hooks/useFormValidation";
import { validatePost } from "../../util/validation";

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
import TagInput from "../TagInput";

const INITIAL_STATE = {
  name: "",
  body: "",
  tags: [],
};

export default function AddPost({ toggle }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    values,
    errors,
    valid,
  } = useFormValidation(INITIAL_STATE, validatePost, addPost);

  function addPost() {
    sendData("post/", "POST", values);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>Nový post</ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="name">Názov postu:</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Názov postu"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                invalid={errors.name && errors.name.length > 0}
                valid={valid.name && valid.name.length > 0}
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
              <Label for="body">Obsah:</Label>
              <Input
                type="textarea"
                id="body"
                name="body"
                placeholder="Text postu..."
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.body}
                invalid={errors.body && errors.body.length > 0}
                valid={valid.body && valid.body.length > 0}
                autoComplete="off"
              />
              <FormFeedback invalid="true">{errors.body}</FormFeedback>
              <FormFeedback valid>{valid.body}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <TagInput
          errors={errors}
          valid={valid}
          values={values}
          setValues={setValues}
          handleBlur={handleBlur}
        />
        {data && (
          <Row className="justify-content-center my-3">
            <Col>
              <Alert
                color={error ? "danger" : "success"}
                isOpen={data}
                toggle={hideMessage}
              >
                {data.message}
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
