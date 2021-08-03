import React, { useContext } from "react";

import { Row, Col, Alert, Button, FormGroup } from "reactstrap";
import { FileEarmark } from "react-bootstrap-icons";

import { AuthContext } from "../../context/auth";

export default function Announcements({ announcements, dispatch }) {
  const { user } = useContext(AuthContext);

  return (
    <>
      <hr />
      {announcements.map((announcement) => {
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        return (
          <Row key={announcement._id} form>
            <Col>
              <Alert color="primary">
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
                <p className="font-weight-bold">{announcement.name}</p>
                <p>{announcement.content}</p>
                {announcement.files.length !== 0 && (
                  <Row form>
                    {announcement.files.map((file, key) => (
                      <FormGroup key={key} className="mx-1" row>
                        <Button
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
                  {new Date(announcement.updatedAt).toLocaleDateString(
                    "sk-SK",
                    options
                  )}
                </p>
              </Alert>
            </Col>
          </Row>
        );
      })}
    </>
  );
}
