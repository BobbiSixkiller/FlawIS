import React from "react";
import API from "../../api";

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

function DeletePost(props) {
  const { modal, setModal, refresh } = props;

  const [backendMsg, setBackendMsg] = React.useState(null);
  const [error, setError] = React.useState(false);

  async function deletePost(e) {
    e.preventDefault();
    try {
      const res = await API.delete(`post/${modal.post._id}`);
      setBackendMsg(res.data.msg);
    } catch (err) {
      setError(true);
      setBackendMsg(err.response.data.error);
    }
  }

  return (
    <Form onSubmit={(e) => deletePost(e)}>
      <ModalHeader
        toggle={() => {
          setModal(!modal);
          refresh();
        }}
      >
        Zmazať post
      </ModalHeader>
      <ModalBody>
        <p>Potvrďte zmazanie postu:</p>
        <p className="font-weight-bold">{modal.post.name}</p>
        <p>
          Zverejnil: {modal.post.author},{" "}
          {new Date(modal.post.updatedAt).toLocaleDateString()}
        </p>
        {backendMsg && (
          <Row className="justify-content-center my-3">
            <Col>
              <Alert color={error ? "danger" : "success"}>
                {backendMsg}
                <Button close onClick={() => setBackendMsg(null)} />
              </Alert>
            </Col>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="submit" color="danger">
          Zmazať
        </Button>{" "}
        <Button
          outline
          color="secondary"
          onClick={() => {
            setModal(!modal);
            refresh();
          }}
        >
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}

export default DeletePost;
