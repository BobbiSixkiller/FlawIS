import React, { useState } from "react";
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";

import {
  Row,
  ButtonGroup,
  Button,
  Table,
  Spinner,
  Fade,
  Modal,
} from "reactstrap";
import { Trash2Fill, PencilFill } from "react-bootstrap-icons";

import { useDataFetch } from "../../hooks/useApi";

import User from "./User";

export default function Users() {
  const { path, url } = useRouteMatch();
  console.log(path, url);
  const [modal, setModal] = useState(false);

  const {
    state: { loading, data },
    refreshData,
  } = useDataFetch("user/", []);

  if (loading) {
    return (
      <Row className="justify-content-center">
        <Spinner />
      </Row>
    );
  }
  return (
    <Switch>
      <Route exact path={path}>
        <Fade>
          <Row className="justify-content-between my-3">
            <h1>Manažment používateľov</h1>
            <Button outline color="success" size="lg">
              Pridať
            </Button>
          </Row>
          <Table hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Meno</th>
                <th>Email</th>
                <th>Hodiny</th>
                <th>Rola</th>
                <th>Vytvorený</th>
                <th>Aktualizovaný</th>
                <th>Akcia</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user, i) => (
                <tr key={i}>
                  <th scope="row">{i}</th>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.hoursTotal}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(user.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      tag={Link}
                      to={`${url}/${user._id}`}
                      size="sm"
                      color="info"
                    >
                      Zobraziť
                    </Button>{" "}
                    <ButtonGroup>
                      <Button
                        size="sm"
                        color="warning"
                        onClick={() =>
                          setModal({ show: true, action: "edit", user })
                        }
                      >
                        <PencilFill />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() =>
                          setModal({
                            show: true,
                            action: "delete",
                            user,
                          })
                        }
                      >
                        <Trash2Fill />
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button className="mb-5" tag={Link} to="/" outline color="primary">
            Späť
          </Button>
          <Modal
            isOpen={modal.show}
            toggle={() => {
              setModal(!modal);
              refreshData();
            }}
          >
            {/* {modal.action === "add" && (
              <AddPost
                refresh={refreshData}
                modal={modal}
                setModal={setModal}
              />
            )}
            {modal.action === "delete" && (
              <DeletePost
                refresh={refreshData}
                modal={modal}
                setModal={setModal}
              />
            )}
            {modal.action === "edit" && (
              <EditPost
                refresh={refreshData}
                modal={modal}
                setModal={setModal}
              />
            )} */}
          </Modal>
        </Fade>
      </Route>
      <Route path={`${path}/:id`}>
        <User />
      </Route>
    </Switch>
  );
}
