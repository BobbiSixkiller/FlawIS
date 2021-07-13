import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

import {
  Modal,
  Row,
  FormGroup,
  Fade,
  Jumbotron,
  ButtonGroup,
  Button,
  Spinner,
  Alert,
} from "reactstrap";
import { FileEarmark, PencilFill, Trash2Fill } from "react-bootstrap-icons";

import { useDataFetch } from "../../hooks/useApi";
import useModal from "../../hooks/useModal";

import EditAnnouncement from "../../components/announcement/EditAnnouncement";
import DeleteAnnouncement from "../../components/announcement/DeleteAnnouncement";

export default function Announcement() {
  const history = useHistory();
  const { id } = useParams();

  const { show, action, modalData, dispatch } = useModal();
  const { loading, error, data, setUrl, refreshData } = useDataFetch(
    `announcement/${id}`,
    {},
    "GET"
  );

  useEffect(() => {
    setUrl(`announcement/${id}`);
  }, [id, setUrl]);

  function toggle() {
    dispatch({ type: "TOGGLE" });
    refreshData();
  }

  if (loading) {
    return (
      <Row className="justify-content-center">
        <Spinner />
      </Row>
    );
  } else if (error) {
    return (
      <>
        <Alert color="danger" className="text-center">
          Oznam nebol nájdený!{" "}
          <Button
            close
            onClick={() => {
              history.goBack();
              refreshData();
            }}
          />
        </Alert>
        <Button color="primary" onClick={() => history.goBack()}>
          Späť
        </Button>
      </>
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
          <ButtonGroup>
            <Button
              outline
              size="sm"
              color="warning"
              onClick={() =>
                dispatch({ type: "ACTION", name: "UPDATE", payload: data })
              }
            >
              <PencilFill />
            </Button>
            <Button
              outline
              size="sm"
              color="danger"
              onClick={() =>
                dispatch({ type: "ACTION", name: "DELETE", payload: data })
              }
            >
              <Trash2Fill />
            </Button>
          </ButtonGroup>
        </p>
      </Jumbotron>
      <Modal isOpen={show} toggle={toggle}>
        {action === "DELETE" && (
          <DeleteAnnouncement toggle={toggle} announcement={modalData} />
        )}
        {action === "UPDATE" && (
          <EditAnnouncement
            toggle={toggle}
            announcement={modalData}
            dispatch={dispatch}
          />
        )}
      </Modal>
    </Fade>
  );
}
