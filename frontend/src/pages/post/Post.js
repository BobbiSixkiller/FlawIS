import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

import useDataFetch from "../../hooks/useDataFetch";

import { Row, Fade, Jumbotron, Button, Spinner, Alert } from "reactstrap";

export default function Post() {
  const history = useHistory();
  const { id } = useParams();

  const {
    state: { loading, error, data },
    setUrl,
  } = useDataFetch(`post/${id}`, {}, "GET");

  useEffect(() => {
    setUrl(`post/${id}`);
  }, [id, setUrl]);

  if (loading) {
    return (
      <Row className="justify-content-center">
        <Spinner />
      </Row>
    );
  } else if (error) {
    return (
      <Alert color="danger">
        {error} <Button close onClick={() => history.goBack()} />
      </Alert>
    );
  } else {
    return (
      <Fade>
        <Jumbotron>
          <h1 className="display-3">{data && data.name}</h1>
          <p className="lead">
            Autor: {data && data.author}, dňa{" "}
            {new Date(data && data.updatedAt).toLocaleDateString()}
          </p>
          <hr className="my-2" />
          <p className="text-muted">
            {data && data.tags && data && data.tags.map((tag) => `#${tag} `)}
          </p>
          <p>{data && data.body}</p>
          <p className="lead">
            <Button color="primary" onClick={() => history.goBack()}>
              Späť
            </Button>
          </p>
        </Jumbotron>
      </Fade>
    );
  }
}
