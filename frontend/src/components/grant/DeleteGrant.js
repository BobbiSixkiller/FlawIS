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

function DeleteGrant({ refresh, grant, dispatch }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  function deleteGrant(e) {
    e.preventDefault();
    sendData(`grant/${grant._id}`, "DELETE");
  }

  function toggle() {
    dispatch({ type: "TOGGLE" });
    refresh();
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
              <Alert color={error ? "danger" : "success"}>
                {data.msg}
                <Button close onClick={() => hideMessage()} />
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

export default DeleteGrant;
