import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

import {
  Row,
  FormGroup,
  Fade,
  Jumbotron,
  Button,
  Spinner,
  Alert,
} from "reactstrap";
import { FileEarmark, PencilFill } from "react-bootstrap-icons";

import { useDataFetch } from "../../hooks/useApi";
import useModal from "../../hooks/useModal";

export default function Announcement() {
  const history = useHistory();
  const { id } = useParams();

  const { loading, error, data, setUrl } = useDataFetch(
    `announcement/${id}`,
    {},
    "GET"
  );

  useEffect(() => {
    setUrl(`announcement/${id}`);
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
        Oznam nebol nájdený! <Button close onClick={() => history.goBack()} />
      </Alert>
    );
  }

  return (
    <Fade>
      <Jumbotron>
        <h1 className="display-3">{data.name}</h1>
        <p className="lead">
          Pridal: {data.issuedBy && data.issuedBy.fullName}, dňa{" "}
          {new Date(data.updatedAt).toLocaleDateString()}
        </p>
        <hr className="my-2" />
        <p className="text-muted">
          Prepojenia: {data.grants && data.grants.length}
        </p>
        <p>{data.content}</p>
        {data.files && data.files.length !== 0 && (
          <Row form>
            {data.files.map((file, key) => (
              <FormGroup key={key} className="mx-1" row>
                <Button target="_blank" href={file.url} outline color="primary">
                  <FileEarmark /> {file.name}
                </Button>
              </FormGroup>
            ))}
          </Row>
        )}
        <p className="lead">
          <Button color="primary" onClick={() => history.goBack()}>
            Späť
          </Button>{" "}
          <Button outline size="sm" color="warning">
            <PencilFill />
          </Button>
        </p>
      </Jumbotron>
    </Fade>
  );
}
