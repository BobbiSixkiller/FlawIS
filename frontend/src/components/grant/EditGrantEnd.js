import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import {
  Alert,
  Button,
  Col,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Spinner,
} from "reactstrap";

import DateInput from "../form/DateInput";
import { useDataSend } from "../../hooks/useApi";

export default function EditGrantEnd({ toggle, modalData }) {
  const { data, error, hideMessage, sendData } = useDataSend();

  return (
    <Formik
      initialValues={{
        end: new Date(modalData.end).toISOString().slice(0, 10),
      }}
      validationSchema={Yup.object({ end: Yup.date().required() })}
      onSubmit={async (values, helpers) =>
        await sendData(`grant/${modalData.grantId}`, "PUT", values)
      }
    >
      {({ isSubmitting }) => (
        <Form>
          <ModalHeader toggle={toggle}>Upraviť riešiteľa</ModalHeader>
          <ModalBody>
            <Row form className="justify-content-center">
              <Col>
                <DateInput name="end" label="Koniec grantu" />
              </Col>
            </Row>
            {data && (
              <Row className="justify-content-center my-3">
                <Col>
                  <Alert
                    color={error ? "danger" : "success"}
                    isOpen={data.message.length !== 0}
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
