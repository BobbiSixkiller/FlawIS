import React, { useEffect } from "react";
import {
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

function DeleteFile({ show, dispatch, nestedDispatch, modalData }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  function deleteFile() {
    sendData(
      `announcement/${modalData.announcement._id}/file/${modalData.file._id}`,
      "DELETE"
    );
  }

  useEffect(() => {
    if (data && !error) {
      dispatch({
        type: "UPDATE_DATA",
        payload: data.announcement,
      });
    }
  }, [data, error, dispatch]);

  function toggle() {
    nestedDispatch({ type: "TOGGLE" });
    hideMessage();
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
                {error ? data.errors.map((e) => e) : data.message}
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
