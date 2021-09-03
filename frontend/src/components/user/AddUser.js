import React from "react";
import { Formik, Form } from "formik";
import { normalizeErrors } from "../../util/helperFunctions";

import {
  Alert,
  Spinner,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
} from "reactstrap";

import TextInput from "../form/TextInput";
import SelectInput from "../form/SelectInput";

import { useDataSend } from "../../hooks/useApi";
import { userSchema } from "../../util/validation";

export default function AddUser({ toggle }) {
  const { error, data, sendData, hideMessage } = useDataSend();

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        repeatPass: "",
        role: "basic",
      }}
      validationSchema={userSchema}
      onSubmit={async (values, { setErrors }) => {
        const res = await sendData("user/", "POST", values);
        if (!res.success) {
          setErrors(normalizeErrors(res.errors));
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <ModalHeader toggle={toggle}>Nový používateľ</ModalHeader>
          <ModalBody>
            <Row form>
              <Col>
                <SelectInput
                  name="role"
                  label="Rola používateľa"
                  options={[
                    { name: "Používateľ", value: "basic" },
                    { name: "Grantové oddelenie", value: "supervisor" },
                    { name: "Administrátor", value: "admin" },
                  ]}
                />
              </Col>
            </Row>
            <Row form>
              <Col>
                <TextInput
                  type="text"
                  name="firstName"
                  placeholder="Krstné meno..."
                  label="Krstné meno"
                />
              </Col>
            </Row>
            <Row form>
              <Col>
                <TextInput
                  type="text"
                  name="lastName"
                  placeholder="Priezvisko..."
                  label="Priezvisko"
                />
              </Col>
            </Row>
            <Row form>
              <Col>
                <TextInput
                  type="email"
                  name="email"
                  placeholder="Email adresa..."
                  label="Email"
                />
              </Col>
            </Row>
            <Row form>
              <Col>
                <TextInput
                  type="password"
                  name="password"
                  placeholder="Heslo..."
                  label="Heslo"
                />
              </Col>
            </Row>
            <Row form>
              <Col>
                <TextInput
                  type="password"
                  name="repeatPass"
                  placeholder="Zopakujte heslo..."
                  label="Heslo znovu"
                />
              </Col>
            </Row>
            {data && (
              <Row className="justify-content-center my-3">
                <Col>
                  <Alert
                    color={error ? "danger" : "success"}
                    show={data}
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
