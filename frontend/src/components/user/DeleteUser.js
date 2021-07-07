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

export default function DeleteUser(props) {
  const { user, dispatch, refresh } = props;

  const {
    state: { loading, error, data },
    sendData,
    hideMessage,
  } = useDataSend();

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        sendData(`user/${user._id}`, "DELETE");
      }}
    >
      <ModalHeader
        toggle={() => {
          dispatch({ type: "TOGGLE" });
          refresh();
        }}
      >
        Zmazať používateľa
      </ModalHeader>
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
        <Button
          outline
          color="secondary"
          onClick={() => {
            dispatch({ type: "TOGGLE" });
            refresh();
          }}
        >
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
