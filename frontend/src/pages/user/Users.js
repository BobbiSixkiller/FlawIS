import React, { useState, useEffect, useContext } from "react";
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";

import { Row, Button, Table, Spinner, Fade, Modal } from "reactstrap";
import { Trash2Fill, PencilFill } from "react-bootstrap-icons";

import useModal from "../../hooks/useModal";
import { useDataFetch } from "../../hooks/useApi";
import { AuthContext } from "../../context/auth";

import User from "./User";
import AddUser from "../../components/user/AddUser";
import EditUser from "../../components/user/EditUser";
import DeleteUser from "../../components/user/DeleteUser";
import PaginationComponent from "../../components/PaginationComponent";

export default function Users() {
  const auth = useContext(AuthContext);
  const { path, url } = useRouteMatch();
  const [page, setPage] = useState(1);

  const { dispatch, show, action, modalData } = useModal();

  const { loading, data, setUrl, refreshData } = useDataFetch("user/", []);

  useEffect(() => {
    setUrl(`user?page=${page}`);
  }, [page, setUrl]);

<<<<<<< HEAD
  function toggle() {
    dispatch({ type: "TOGGLE" });
    refreshData();
  }

=======
>>>>>>> 1373e2ac8cc4a860090e5acb909ee3de5f810344
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
            <h1>Manažment používateľov</h1>
            <Button
              outline
              color="success"
              size="lg"
<<<<<<< HEAD
              onClick={() => dispatch({ type: "ACTION", name: "ADD" })}
=======
              onClick={() => dispatch({ type: "ADD" })}
>>>>>>> 1373e2ac8cc4a860090e5acb909ee3de5f810344
            >
              Pridať
            </Button>
          </Row>
          <Table className="my-2" hover responsive>
            <thead>
              <tr>
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
              {data.users &&
                data.users.map((user) => (
                  <tr key={user._id}>
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
                      <Button
                        outline
                        size="sm"
                        color="warning"
                        onClick={() =>
<<<<<<< HEAD
                          dispatch({
                            type: "ACTION",
                            name: "UPDATE",
                            payload: user,
                          })
=======
                          dispatch({ type: "UPDATE", payload: user })
>>>>>>> 1373e2ac8cc4a860090e5acb909ee3de5f810344
                        }
                      >
                        <PencilFill />
                      </Button>{" "}
                      {auth.user.role === "admin" && (
                        <Button
                          outline
                          size="sm"
                          color="danger"
                          onClick={() =>
                            dispatch({
                              type: "ACTION",
                              name: "DELETE",
                              payload: user,
                            })
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
<<<<<<< HEAD
          <Button tag={Link} to="/" outline color="primary">
            Späť
          </Button>
          <Modal isOpen={show} toggle={toggle}>
            {action === "ADD" && <AddUser toggle={toggle} />}
            {action === "DELETE" && (
              <DeleteUser user={modalData} toggle={toggle} />
            )}
            {action === "UPDATE" && (
              <EditUser user={modalData} toggle={toggle} />
=======
          <Button className="mb-5" tag={Link} to="/" outline color="primary">
            Späť
          </Button>
          <Modal
            isOpen={show}
            toggle={() => {
              dispatch({ type: "TOGGLE" });
              refreshData();
            }}
          >
            {action === "ADD" && (
              <AddUser refresh={refreshData} dispatch={dispatch} />
            )}
            {action === "DELETE" && (
              <DeleteUser
                refresh={refreshData}
                user={modalData}
                dispatch={dispatch}
              />
            )}
            {action === "UPDATE" && (
              <EditUser
                refresh={refreshData}
                user={modalData}
                dispatch={dispatch}
              />
>>>>>>> 1373e2ac8cc4a860090e5acb909ee3de5f810344
            )}
          </Modal>
        </Fade>
      </Route>
      <Route path={`${path}/:id`}>
        <User />
      </Route>
    </Switch>
  );
}
