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

function DeleteAnnouncement({ toggle, announcement }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  function deleteAnnouncement(e) {
    e.preventDefault();
    sendData(`announcement/${announcement._id}`, "DELETE");
  }

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const issuedDate = new Date(announcement.updatedAt).toLocaleDateString(
    "sk-SK",
    options
  );

  return (
    <Form onSubmit={deleteAnnouncement}>
      <ModalHeader toggle={toggle}>Zmazať oznam</ModalHeader>
      <ModalBody>
        <p>Potvrďte zmazanie oznamu:</p>
        <p className="font-weight-bold">{announcement.name}</p>
        <p>
          Zverejnil:{" "}
          {announcement.issuedBy
            ? announcement.issuedBy.fullName
            : "Používateľ bol zmazaný"}
          , {issuedDate}
        </p>
        {data && (
          <Row row className="justify-content-center">
            <Col>
              <Alert color={error ? "danger" : "success"}>
                {data.msg}
                <Button close onClick={hideMessage} />
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

export default DeleteAnnouncement;
