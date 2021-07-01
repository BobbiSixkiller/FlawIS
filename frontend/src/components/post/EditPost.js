import React from "react";

import useFormSubmit from "../../hooks/useFormSubmit";
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

function EditPost(props) {
  const {
    modal: { post },
    setModal,
    refresh,
  } = props;

  const INITIAL_STATE = {
    name: post.name,
    body: post.body,
    tags: post.tags,
  };

  const {
    handleInputChange,
    handleArrayPush,
    handleArrayFilter,
    handleBlur,
    handleSubmit,
    hideRes,
    state: { loading, values, valid, errors, error, res },
  } = useFormSubmit(INITIAL_STATE, validatePost, `post/${post._id}`, "PUT");
  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader
        toggle={() => {
          setModal(!post);
          refresh();
        }}
      >
        Upraviť post
      </ModalHeader>
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
          tags={values.tags}
          handleArrayFilter={handleArrayFilter}
          handleArrayPush={handleArrayPush}
          handleBlur={handleBlur}
        />
        {res && (
          <Row className="justify-content-center my-3">
            <Col>
              <Alert color={error ? "danger" : "success"}>
                {res.msg}
                <Button close onClick={hideRes} />
              </Alert>
            </Col>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="submit" disabled={loading} color="warning">
          Aktualizovať
        </Button>{" "}
        <Button
          outline
          color="secondary"
          onClick={() => {
            setModal(!post);
            refresh();
          }}
        >
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}

export default EditPost;
