import React from "react";

import {
  Alert,
  Spinner,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Form,
} from "reactstrap";

import { useDataSend } from "../../hooks/useApi";

export default function DeleteMember({ toggle, modalData }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  async function deleteMember(e) {
    e.preventDefault();
    sendData(
      `grant/${modalData.grantId}/budget/${modalData.budget._id}/member/${modalData.member._id}`,
      "DELETE"
    );
  }

  return (
    <Form onSubmit={deleteMember}>
      <ModalHeader toggle={toggle}>Odobrať riešiteľa</ModalHeader>
      <ModalBody>
        <p>Potvrďte odobratie riešiteľa:</p>
        <p className="font-weight-bold">{modalData.member.member.fullName}</p>
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
          {loading ? <Spinner size="sm" color="light" /> : "Zmazať"}
        </Button>{" "}
        <Button outline color="secondary" onClick={toggle}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
