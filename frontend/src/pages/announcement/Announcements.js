import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, Link } from "react-router-dom";

import { Fade, Button, Spinner, Row, Table, Modal } from "reactstrap";
import { Trash2Fill, PencilFill } from "react-bootstrap-icons";

import { useDataFetch } from "../../hooks/useApi";
import useModal from "../../hooks/useModal";

import PaginationComponent from "../../components/PaginationComponent";
import Announcement from "./Announcement";
import AddAnnouncement from "../../components/announcement/AddAnnouncement";
import EditAnnouncement from "../../components/announcement/EditAnnouncement";
import DeleteAnnouncement from "../../components/announcement/DeleteAnnouncement";

export default function Announcements() {
  const { path, url } = useRouteMatch();

  const [page, setPage] = useState(1);

  const { show, action, modalData, dispatch } = useModal();

  const { loading, data, setUrl, refreshData } = useDataFetch(
    "announcement",
    []
  );

  useEffect(() => {
    setUrl(`announcement?page=${page}`);
  }, [setUrl, page]);

  function toggle() {
    dispatch({ type: "TOGGLE" });
    refreshData();
  }

  function updateAnnouncement(data) {
    dispatch({
      type: "ACTION",
      name: "UPDATE",
      payload: data,
    });
  }

  function deleteAnnouncement(data) {
    dispatch({
      type: "ACTION",
      name: "DELETE",
      payload: data,
    });
  }

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
          <Row form className="justify-content-between">
            <h1>Manažment oznamov</h1>
            <Button
              outline
              size="lg"
              color="success"
              onClick={() => dispatch({ type: "ACTION", name: "ADD" })}
            >
              Nový oznam
            </Button>
          </Row>
          {data.announcements && data.announcements.length === 0 ? (
            <h2 className="text-center my-5">Žiadne oznamy</h2>
          ) : (
            <>
              <Table responsive className="my-5" hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Názov</th>
                    <th>Autor</th>
                    <th>Vytvorený</th>
                    <th>Aktualizovaný</th>
                    <th>Akcia</th>
                  </tr>
                </thead>
                <tbody>
                  {data.announcements &&
                    data.announcements.map((announcement, i) => (
                      <tr key={i}>
                        <td>{i}</td>
                        <td>{announcement.name}</td>
                        <td>
                          {announcement.issuedBy
                            ? announcement.issuedBy.fullName
                            : "Používateľ bol zmazaný"}
                        </td>
                        <td>
                          {new Date(announcement.createdAt).toLocaleString()}
                        </td>
                        <td>
                          {new Date(announcement.updatedAt).toLocaleString()}
                        </td>
                        <td>
                          <Button
                            tag={Link}
                            to={`${url}/${announcement._id}`}
                            size="sm"
                            color="info"
                          >
                            Zobraziť
                          </Button>{" "}
                          <Button
                            outline
                            size="sm"
                            color="warning"
                            onClick={() => updateAnnouncement(announcement)}
                          >
                            <PencilFill />
                          </Button>{" "}
                          <Button
                            outline
                            size="sm"
                            color="danger"
                            onClick={() => deleteAnnouncement(announcement)}
                          >
                            <Trash2Fill />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
              <PaginationComponent
                page={page}
                pages={data.total}
                changePage={setPage}
              />
            </>
          )}
          <Button outline color="primary" tag={Link} to="/dashboard/grants">
            Späť
          </Button>
          <Modal isOpen={show} toggle={toggle}>
            {action === "ADD" && <AddAnnouncement toggle={toggle} />}
            {action === "DELETE" && (
              <DeleteAnnouncement
                toggle={toggle}
                deleteAnnouncement={deleteAnnouncement}
                announcement={modalData}
              />
            )}
            {action === "UPDATE" && (
              <EditAnnouncement
                toggle={toggle}
                updateAnnouncement={updateAnnouncement}
                announcement={modalData}
                dispatch={dispatch}
              />
            )}
          </Modal>
        </Fade>
      </Route>
      <Route path={`${path}/:id`}>
        <Announcement />
      </Route>
    </Switch>
  );
}
