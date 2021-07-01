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

function DeletePost(props) {
  const {
    modal: { post },
    setModal,
    refresh,
  } = props;

  const {
    state: { loading, error, data },
    sendData,
    hideMessage,
  } = useDataSend();

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        sendData(`post/${post._id}`, "DELETE");
      }}
    >
      <ModalHeader
        toggle={() => {
          setModal(!post);
          refresh();
        }}
      >
        Zmazať post
      </ModalHeader>
      <ModalBody>
        <p>Potvrďte zmazanie postu:</p>
        <p className="font-weight-bold">{post.name}</p>
        <p>
          Zverejnil: {post.author},{" "}
          {new Date(post.updatedAt).toLocaleDateString()}
        </p>
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
            setModal(!post);
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
