import React, { useState, useEffect, useContext } from "react";
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
import { Trash2Fill } from "react-bootstrap-icons";

import useModal from "../../hooks/useModal";
import { useDataFetch } from "../../hooks/useApi";
import { AuthContext } from "../../context/auth";

import Grant from "./Grant";
import AddGrant from "./AddGrant";
import DeleteGrant from "../../components/grant/DeleteGrant";
import PaginationComponent from "../../components/PaginationComponent";

export default function Grants() {
  const auth = useContext(AuthContext);
  const { path, url } = useRouteMatch();
  const [page, setPage] = useState(1);

  const { dispatch, show, action, modalData } = useModal();

  const { loading, data, setUrl, refreshData } = useDataFetch("grant/", []);

  useEffect(() => {
    setUrl(`grant?page=${page}`);
  }, [page, setUrl]);

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
<<<<<<< HEAD
          <Row className="justify-content-between mb-3">
=======
          <Row className="justify-content-between my-3">
>>>>>>> 1373e2ac8cc4a860090e5acb909ee3de5f810344
            <h1>Manažment grantov</h1>
            <ButtonGroup>
              <Button outline color="primary" size="lg">
                Oznamy
              </Button>
              <Button
                color="success"
                size="lg"
                onClick={() => dispatch({ type: "ADD" })}
              >
                Nový grant
              </Button>
            </ButtonGroup>
          </Row>
          <Table className="my-2" hover responsive>
            <thead>
              <tr>
                <th>Názov</th>
                <th>ID</th>
                <th>Typ</th>
                <th>Začiatok</th>
                <th>Koniec</th>
                <th>Aktualizovaný</th>
                <th>Akcia</th>
              </tr>
            </thead>
            <tbody>
              {data.grants &&
                data.grants.map((grant) => (
                  <tr key={grant._id}>
                    <td>{grant.name}</td>
                    <td>{grant.idNumber}</td>
                    <td>{grant.type}</td>
                    <td>{new Date(grant.start).toLocaleDateString()}</td>
                    <td>{new Date(grant.end).toLocaleDateString()}</td>
                    <td>{new Date(grant.updatedAt).toLocaleString()}</td>
                    <td>
                      <Button
                        tag={Link}
                        to={`${url}/${grant._id}`}
                        size="sm"
                        color="info"
                      >
                        Zobraziť
                      </Button>{" "}
                      {auth.user.role === "admin" && (
                        <Button
                          outline
                          size="sm"
                          color="danger"
                          onClick={() =>
                            dispatch({ type: "DELETE", payload: grant })
                          }
                        >
                          <Trash2Fill />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
          <PaginationComponent
            page={page}
            pages={data.pages}
            changePage={setPage}
          />
          <Button tag={Link} to="/" outline color="primary">
            Späť
          </Button>
          <Modal
            isOpen={show}
            toggle={() => {
              dispatch({ type: "TOGGLE" });
              refreshData();
            }}
          >
            {action === "DELETE" && (
              <DeleteGrant
                refresh={refreshData}
                grant={modalData}
                dispatch={dispatch}
              />
            )}
          </Modal>
        </Fade>
      </Route>
      <Route path={`${path}/:id`}>
        <Grant />
      </Route>
      <Route path={`${path}/new`}>
        <AddGrant />
      </Route>
    </Switch>
  );
}
