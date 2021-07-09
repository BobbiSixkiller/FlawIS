import React from "react";

import { useDataSend } from "../../hooks/useApi";

import {
  Alert,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Form,
} from "reactstrap";

export default function DeleteUser({ user, toggle }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  function deleteUser(e) {
    e.preventDefault();
    sendData(`user/${user._id}`, "DELETE");
  }

  return (
    <Form onSubmit={deleteUser}>
      <ModalHeader toggle={toggle}>Zmazať používateľa</ModalHeader>
      <ModalBody>
        <p>Potvrďte zmazanie používateľa:</p>
        <p className="font-weight-bold">{user.fullName}</p>
        {data && (
          <Row className="justify-content-center my-3">
            <Col>
              <Alert color={error ? "danger" : "success"}>
                {data.msg}
                <Button close onClick={() => hideMessage()} />
              </Alert>
            </Col>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="submit" color="danger" disabled={loading}>
          Zmazať
        </Button>{" "}
        <Button outline color="secondary" onClick={toggle}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
