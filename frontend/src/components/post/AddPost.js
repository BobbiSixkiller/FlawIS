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

export default function AddPost({ toggle }) {
  const { error, data, sendData, hideMessage } = useDataSend();

  return (
    <Formik
      initialValues={{ name: "", body: "", tags: [] }}
      validationSchema={postSchema}
      onSubmit={async (values, helpers) => {
        const res = await sendData("post/", "POST", values);
        console.log(res);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <ModalHeader toggle={toggle}>Nový post</ModalHeader>
          <ModalBody>
            <Row form>
              <Col>
                <TextInput
                  type="text"
                  name="name"
                  placeholder="Názov postu..."
                  label="Názov"
                />
              </Col>
            </Row>
            <Row form>
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
            <Button type="submit" disabled={isSubmitting} color="success">
              {isSubmitting ? <Spinner size="sm" color="light" /> : "Pridať"}
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
