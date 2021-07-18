import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import { Fade, Alert, Col, Row, Button } from "reactstrap";

import { AuthContext } from "../context/auth";

function Home() {
  const { user } = useContext(AuthContext);

  if (user) return <Redirect to="/dashboard" />;

  return (
    <Fade>
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
