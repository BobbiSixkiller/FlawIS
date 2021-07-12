import React from "react";
import {
  Form,
  Row,
  Col,
  Alert,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import { useDataSend } from "../../hooks/useApi";

function DeleteFile({ show, dispatch, modalData, removeFile }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  function deleteFile() {
    sendData(
      `announcement/${modalData.announcement._id}/file/${modalData.file._id}`,
      "DELETE"
    );
    removeFile(modalData.file._id);
  }

  function toggle() {
    dispatch({ type: "TOGGLE" });
  }

  return (
    <Modal isOpen={show} toggle={toggle}>
      <ModalHeader>Zmazať súbor</ModalHeader>
      <ModalBody>
        <p>Potvrďte zmazanie súboru:</p>
        <p className="font-weight-bold">{show && modalData.file.name}</p>
        {data && (
          <Row className="justify-content-center">
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
        <Button
          color="danger"
          type="submit"
          disabled={loading}
          onClick={deleteFile}
        >
          Zmazať
        </Button>
        <Button onClick={toggle}>Zrušiť</Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteFile;
