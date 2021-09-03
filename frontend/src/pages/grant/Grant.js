import React, { useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";

import {
  Alert,
  Button,
  Container,
  Jumbotron,
  Fade,
  Spinner,
  Row,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
} from "reactstrap";
import { PencilSquare } from "react-bootstrap-icons";

import useModal from "../../hooks/useModal";
import { useDataFetch } from "../../hooks/useApi";
import { AuthContext } from "../../context/auth";

import Announcements from "../../components/grant/Announcements";
import AddAnnouncement from "../../components/announcement/AddAnnouncement";
import DeleteAnnouncement from "../../components/announcement/DeleteAnnouncement";
import Budget from "../../components/grant/Budget";
import EditBudget from "../../components/grant/EditBudget";
import AddMember from "../../components/grant/AddMember";
import EditMember from "../../components/grant/EditMember";
import DeleteMember from "../../components/grant/DeleteMember";
import EditGrantEnd from "../../components/grant/EditGrantEnd";

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
        <Jumbotron>
          <h1 className="display-3">{data.name}</h1>
          <Row className="my-3" form>
            <FormGroup>
              <Col>
                <Label for="grantID">ID:</Label>
                <Input id="grantID" plaintext readOnly value={data.idNumber} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col>
                <Label for="grantType">Typ:</Label>
                <Input id="grantType" plaintext readOnly value={data.type} />
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
                <PencilSquare
                  className="mr-1"
                  color="#007BFF"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    dispatch({
                      type: "ACTION",
                      name: "UPDATE_END",
                      payload: { grantId: data._id, end: data.end },
                    })
                  }
                />

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
          {data.announcements && data.announcements.length !== 0 && (
            <Announcements
              announcements={data.announcements}
              dispatch={dispatch}
            />
          )}
        </Jumbotron>
        {data.budget && (
          <Budget
            grantId={data._id}
            budget={data.budget}
            dispatch={dispatch}
            isCheckout={false}
          />
        )}
        <Button onClick={() => history.goBack()} outline color="primary">
          Späť
        </Button>
        <Modal isOpen={show} toggle={toggle}>
          {action === "UPDATE_END" && (
            <EditGrantEnd toggle={toggle} modalData={modalData} />
          )}
          {action === "UPDATE_BUDGET" && (
            <EditBudget toggle={toggle} modalData={modalData} />
          )}
          {action === "UPDATE_MEMBER" && (
            <EditMember toggle={toggle} modalData={modalData} />
          )}
          {action === "DELETE_MEMBER" && (
            <DeleteMember toggle={toggle} modalData={modalData} />
          )}
          {action === "ADD_MEMBER" && (
            <AddMember toggle={toggle} modalData={modalData} />
          )}
          {action === "ADD_ANNOUNCEMENT" && (
            <AddAnnouncement toggle={toggle} grantId={modalData._id} />
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
