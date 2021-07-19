import React from "react";

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

import { useDataSend } from "../../hooks/useApi";

export default function DeleteGrant({ toggle, grant }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  function deleteGrant(e) {
    e.preventDefault();
    sendData(`grant/${grant._id}`, "DELETE");
  }

  return (
    <Form onSubmit={deleteGrant}>
      <ModalHeader toggle={toggle}>Zmazať grant</ModalHeader>
      <ModalBody>
        <p>Potvrďte zmazanie grantu:</p>
        <p className="font-weight-bold">{grant.name}</p>
        {data && (
          <Row row className="justify-content-center">
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
        <Button color="danger" type="submit" disabled={loading}>
          Zmazať
        </Button>{" "}
        <Button outline color="secondary" onClick={toggle}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
