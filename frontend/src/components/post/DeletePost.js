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

export default function DeletePost({ post, toggle }) {
  const { loading, error, data, sendData, hideMessage } = useDataSend();

  function deletePost(e) {
    e.preventDefault();
    sendData(`post/${post._id}`, "DELETE");
  }

  return (
    <Form onSubmit={deletePost}>
      <ModalHeader toggle={toggle}>Zmazať post</ModalHeader>
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
