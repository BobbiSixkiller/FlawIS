import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import {
  Alert,
  Fade,
  Row,
  Spinner,
  Col,
  Input,
  Label,
  Jumbotron,
  Button,
} from "reactstrap";

import MyGrants from "../../components/user/MyGrants";

import { useDataFetch } from "../../hooks/useApi";

export default function User() {
  const history = useHistory();
  const { id } = useParams();

  const { data, loading, error, setUrl } = useDataFetch(`user/${id}`, {});

  useEffect(() => {
    setUrl(`user/${id}`);
  }, [id, setUrl]);

  if (loading) {
    return (
      <Row className="justify-content-center">
        <Spinner />
      </Row>
    );
  } else if (error) {
    return (
      <Alert color="danger" className="text-center">
        Používateľ nebol nájdený!{" "}
        <Button close onClick={() => history.goBack()} />
      </Alert>
    );
  }

  return (
    <Fade>
      <Jumbotron className="my-5">
        <h1 className="text-center">Profil</h1>
        <Row form>
          <Col md={4}>
            <Label for="full-name">Meno:</Label>
            <Input id="full-name" plaintext readOnly value={data.fullName} />
          </Col>
          <Col md={4}>
            <Label for="email">Email:</Label>
            <Input id="email" plaintext readOnly value={data.email} />
          </Col>
          <Col md={4}>
            <Label for="role">Rola:</Label>
            <Input id="role" plaintext readOnly value={data.role} />
          </Col>
        </Row>
        <hr />
        <MyGrants />
        <Button
          className="mt-3"
          outline
          color="primary"
          onClick={() => history.goBack()}
        >
          Späť
        </Button>
      </Jumbotron>
    </Fade>
  );
}
