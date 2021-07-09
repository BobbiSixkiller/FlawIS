import React, { useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";

import { FileEarmark } from "react-bootstrap-icons";

import {
  Jumbotron,
  Fade,
  Button,
  Spinner,
  Container,
  Row,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  Alert,
} from "reactstrap";

import useModal from "../../hooks/useModal";
import { useDataFetch } from "../../hooks/useApi";
import { AuthContext } from "../../context/auth";

import AddAnnouncement from "../../components/grant/AddAnnouncement";
import DeleteAnnouncement from "../../components/announcement/DeleteAnnouncement";

function GrantDetail() {
  const history = useHistory();
  const { id } = useParams();

  const { user } = useContext(AuthContext);

  const { show, action, modalData, dispatch } = useModal();

  const { setUrl, refreshData, loading, error, data } = useDataFetch(
    `grant/${id}`,
    {}
  );

  useEffect(() => {
    setUrl(`grant/${id}`);
  }, [id, setUrl]);

  function toggle() {
    dispatch({ type: "TOGGLE" });
    refreshData();
  }

  if (loading) {
    return (
      <Container className="text-center">
        <Spinner />
      </Container>
    );
  } else if (error) {
    return (
      <Alert color="danger" className="text-center">
        Grant nebol nájdený! <Button close onClick={() => history.goBack()} />
      </Alert>
    );
  }

  return (
    <Fade>
      <Container>
        {data && (
          <>
            <Jumbotron>
              <h1>{data.name}</h1>
              <Row className="my-3" form>
                <FormGroup>
                  <Col>
                    <Label for="grantID">ID:</Label>
                    <Input
                      id="grantID"
                      plaintext
                      readOnly
                      value={data.idNumber}
                    />
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col>
                    <Label for="grantType">Typ:</Label>
                    <Input
                      id="grantType"
                      plaintext
                      readOnly
                      value={data.type}
                    />
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col>
                    <Label for="start">Začiatok grantu:</Label>
                    <Input
                      id="start"
                      plaintext
                      readOnly
                      value={new Date(data.start).toLocaleDateString()}
                    />
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col>
                    <Label for="end">Koniec grantu:</Label>
                    <Input
                      id="end"
                      plaintext
                      readOnly
                      value={new Date(data.end).toLocaleDateString()}
                    />
                  </Col>
                </FormGroup>
              </Row>
              <Row form>
                <FormGroup>
                  <Col>
                    <Label for="created">Vytvorený:</Label>
                    <Input
                      id="created"
                      plaintext
                      readOnly
                      value={new Date(data.createdAt).toLocaleString()}
                    />
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col>
                    <Label for="modiffied">Upravený:</Label>
                    <Input
                      id="modiffied"
                      plaintext
                      readOnly
                      value={new Date(data.updatedAt).toLocaleString()}
                    />
                  </Col>
                </FormGroup>
              </Row>
              {user.role !== "basic" && (
                <Row form>
                  <FormGroup>
                    <Col>
                      <Button
                        color="success"
                        onClick={() =>
                          dispatch({
                            type: "ACTION",
                            name: "ADD_ANNOUNCEMENT",
                            payload: data,
                          })
                        }
                      >
                        Pridať oznam
                      </Button>
                    </Col>
                  </FormGroup>
                </Row>
              )}
              {data.announcements && (
                <>
                  <hr />
                  {data.announcements.map((announcement) => {
                    const options = {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    };
                    return (
                      <Row form>
                        <Col>
                          <Alert key={announcement._id} color="primary">
                            {user.role !== "basic" && (
                              <Button
                                close
                                onClick={() =>
                                  dispatch({
                                    type: "ACTION",
                                    name: "DELETE_ANNOUNCEMENT",
                                    payload: announcement,
                                  })
                                }
                              />
                            )}
                            <p className="font-weight-bold">
                              {announcement.name}
                            </p>
                            <p>{announcement.content}</p>
                            {announcement.files.length !== 0 && (
                              <Row form>
                                {announcement.files.map((file, key) => (
                                  <FormGroup className="mx-1" row>
                                    <Button
                                      key={key}
                                      target="_blank"
                                      href={file.url}
                                      outline
                                      color="primary"
                                    >
                                      <FileEarmark /> {file.name}
                                    </Button>
                                  </FormGroup>
                                ))}
                              </Row>
                            )}
                            <hr />
                            <p>
                              Zverejnil:{" "}
                              {announcement.issuedBy
                                ? announcement.issuedBy.fullName
                                : "Používateľ bol zmazaný"}
                              ,{" "}
                              {new Date(
                                announcement.updatedAt
                              ).toLocaleDateString("sk-SK", options)}
                            </p>
                          </Alert>
                        </Col>
                      </Row>
                    );
                  })}
                </>
              )}
            </Jumbotron>
            {/* <Budget grant={data} budget={data.budget} /> */}
          </>
        )}
        <Button onClick={() => history.goBack()} outline color="primary">
          Späť
        </Button>
        <Modal isOpen={show} toggle={toggle}>
          {/* {action === "UPDATE_BUDGET" && <EditBudget />}
          {action === "UPDATE_MEMBER" && <EditMember />}
          {action === "DELETE_MEMBER" && <DeleteMember />}
          {action === "ADD_MEMBER" && <AddMember />} */}
          {action === "ADD_ANNOUNCEMENT" && (
            <AddAnnouncement toggle={toggle} grant={modalData} />
          )}
          {action === "DELETE_ANNOUNCEMENT" && (
            <DeleteAnnouncement toggle={toggle} announcement={modalData} />
          )}
        </Modal>
      </Container>
    </Fade>
  );
}

export default GrantDetail;
