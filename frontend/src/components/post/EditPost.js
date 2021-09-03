import React from "react";
import { Formik, Form, Field } from "formik";

import {
  Alert,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Spinner,
} from "reactstrap";

import TagInput from "./TagInput";
import TextInput from "../form/TextInput";

import { useDataSend } from "../../hooks/useApi";
import { postSchema } from "../../util/validation";

export default function EditPost({ post, toggle }) {
  const { error, data, sendData, hideMessage } = useDataSend();

  return (
    <Formik
      initialValues={{ name: post.name, body: post.body, tags: post.tags }}
      validationSchema={postSchema}
      onSubmit={async (values) => {
        const res = await sendData(`post/${post._id}`, "PUT", values);
        console.log(res);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <ModalHeader toggle={toggle}>Upraviť post</ModalHeader>
          <ModalBody>
            <Row form className="justify-content-center">
              <Col>
                <TextInput
                  type="text"
                  name="name"
                  placeholder="Názov postu..."
                  label="Názov"
                />
              </Col>
            </Row>
            <Row form className="justify-content-center">
              <Col>
                <TextInput
                  type="textarea"
                  name="body"
                  placeholder="Text postu..."
                  label="Obsah"
                />
              </Col>
            </Row>
            <Field name="tags" component={TagInput} />
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
            <Button type="submit" disabled={isSubmitting} color="warning">
              {isSubmitting ? <Spinner size="sm" color="light" /> : "Upraviť"}
            </Button>{" "}
            <Button outline color="secondary" onClick={toggle}>
              Zrušiť
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  );
}
