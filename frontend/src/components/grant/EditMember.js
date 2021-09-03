import React from "react";
import { Formik, Form } from "formik";

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

import SwitchInput from "../form/SwitchInput";
import TextInput from "../form/TextInput";
import NumberInput from "../form/NumberInput";
import RadioInput from "../form/RadioInput";

import { memberSchema } from "../../util/validation";
import { useDataSend } from "../../hooks/useApi";

export default function EditMember({ toggle, modalData }) {
  const { error, data, sendData, hideMessage } = useDataSend();

  return (
    <Formik
      initialValues={{
        hours: modalData.member.hours,
        active: modalData.member.active,
        role: modalData.member.role,
        member: modalData.member.member._id,
        name: modalData.member.member.fullName,
      }}
      validationSchema={memberSchema}
      onSubmit={async (values, helpers) =>
        await sendData(
          `grant/${modalData.grantId}/budget/${modalData.budget._id}/member/${modalData.member._id}`,
          "PUT",
          values
        )
      }
    >
      {({ values, isSubmitting }) => (
        <Form>
          <ModalHeader toggle={toggle}>Upraviť riešiteľa</ModalHeader>
          <ModalBody>
            <Row form className="justify-content-center">
              <Col sm={8}>
                <TextInput name="name" label="Riešiteľ" readOnly plaintext />
              </Col>
              <Col sm={4}>
                <NumberInput name="hours" placeholder="Hodiny" label="Hodiny" />
              </Col>
            </Row>
            <Row form className="justify-content-center">
              <Col sm={8}>
                <RadioInput
                  inline
                  type="radio"
                  name="role"
                  value="basic"
                  label="Riesitel"
                />
                <RadioInput
                  inline
                  type="radio"
                  name="role"
                  value="deputy"
                  label="Zastupca"
                />
                <RadioInput
                  inline
                  type="radio"
                  name="role"
                  value="leader"
                  label="Veduci"
                />
              </Col>
              <Col sm={4}>
                <SwitchInput
                  type="switch"
                  id="active"
                  name="active"
                  label="Active"
                  defaultChecked={values.active}
                />
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
