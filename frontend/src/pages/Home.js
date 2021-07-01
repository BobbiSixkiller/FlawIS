import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import { Fade, Alert, Col, Row, Button } from "reactstrap";

import { AuthContext } from "../context/auth";

function Home() {
  const { user, error, msg, hideMsg } = useContext(AuthContext);

  if (user) return <Redirect to="/dashboard" />;

  return (
    <Fade>
      {msg && (
        <Row className="mb-5">
          <Col>
            <Alert className="text-center" color={error ? "danger" : "primary"}>
              {msg}
              <Button close onClick={() => hideMsg()} />
            </Alert>
          </Col>
        </Row>
      )}
      <Row className="justify-content-center">
        <img
          className="img-fluid"
          src={process.env.PUBLIC_URL + "/flawis-logo.png"}
          alt="Logo main"
        ></img>
      </Row>
    </Fade>
  );
}

export default Home;
