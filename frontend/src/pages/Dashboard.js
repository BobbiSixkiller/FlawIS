import React, { useContext } from "react";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";

import {
  Fade,
  Alert,
  Col,
  Label,
  Input,
  Row,
  Jumbotron,
  Card,
  CardDeck,
  CardText,
  Button,
} from "reactstrap";

import { AuthContext } from "../context/auth";
import { AuthRoute, AdminRoute } from "../util/AuthRoute";

import Posts from "./post/Posts";
import Users from "./user/Users";

export default function Dashboard() {
  const context = useContext(AuthContext);
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <Fade>
          {context.msg && (
            <Row className="mt-5">
              <Col>
                <Alert className="text-center" color="primary">
                  {context.msg}
                  <Button close onClick={() => context.hideMsg()} />
                </Alert>
              </Col>
            </Row>
          )}
          <Jumbotron className="my-5">
            <h1 className="text-center">Profil</h1>
            <Row form>
              <Col className="float-right">
                <Label for="full-name">Meno:</Label>
                <Input
                  id="full-name"
                  plaintext
                  readOnly
                  value={context.user.fullName}
                />
              </Col>
              <Col>
                <Label for="email">Email:</Label>
                <Input
                  id="email"
                  plaintext
                  readOnly
                  value={context.user.email}
                />
              </Col>
            </Row>
            <hr />
            <CardDeck>
              <Card body inverse color="primary">
                <h5 className="card-title">Moje Granty</h5>
                <CardText>
                  Modul poskytuje informácie ohľadne rozpočtu a hodín
                  alokovaných v príslušných grantoch, v ktorých ste zapojený.
                </CardText>
                <Button
                  color="info"
                  tag={Link}
                  to={`${url}/users/${context.user.id}`}
                >
                  Zobraziť
                </Button>
              </Card>
              <Card body inverse color="danger">
                <h5 className="card-title">Nástenka</h5>
                <CardText>
                  Modul poskytuje informácie ohľadne vedeckej práce
                  pedagogických pracovníkov fakulty.
                </CardText>
                <Button color="info" tag={Link} to={`${url}/posts`}>
                  Zobraziť
                </Button>
              </Card>
            </CardDeck>
          </Jumbotron>
        </Fade>
      </Route>
      <AuthRoute path={`${path}/posts`}>
        <Posts />
      </AuthRoute>
      <AdminRoute exact path={`${path}/users`}>
        <Users />
      </AdminRoute>
      <AuthRoute exact path={`${path}/users/:id`}></AuthRoute>
      <AdminRoute exact path={`${path}/grants`}></AdminRoute>
    </Switch>
  );
}
