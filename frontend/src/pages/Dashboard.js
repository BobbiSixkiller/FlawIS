import React, { useContext } from "react";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";

import {
  Fade,
  Alert,
  Col,
  Row,
  Card,
  CardDeck,
  CardText,
  Button,
} from "reactstrap";

import { AuthContext } from "../context/auth";
import { AuthRoute, AdminRoute } from "../util/AuthRoute";

import Grants from "./grant/Grants";
import Posts from "./post/Posts";
import Users from "./user/Users";
import User from "./user/User";

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
          <CardDeck>
            <Card body inverse color="primary">
              <h5 className="card-title">Moje Granty</h5>
              <CardText>
                Modul poskytuje informácie ohľadne rozpočtu a hodín alokovaných
                v príslušných grantoch, v ktorých ste zapojený.
              </CardText>
              <Button
                color="info"
                tag={Link}
                to={`${url}/users/${context.user._id}`}
              >
                Zobraziť
              </Button>
            </Card>
            <Card body inverse color="danger">
              <h5 className="card-title">Nástenka</h5>
              <CardText>
                Modul poskytuje informácie ohľadne vedeckej práce pedagogických
                pracovníkov fakulty.
              </CardText>
              <Button color="info" tag={Link} to={`${url}/posts`}>
                Zobraziť
              </Button>
            </Card>
          </CardDeck>
        </Fade>
      </Route>
      <AuthRoute path={`${path}/users/:id`}>
        <User />
      </AuthRoute>
      <AuthRoute path={`${path}/posts`}>
        <Posts />
      </AuthRoute>
      <AdminRoute path={`${path}/users`}>
        <Users />
      </AdminRoute>
      <AdminRoute path={`${path}/grants`}>
        <Grants />
      </AdminRoute>
    </Switch>
  );
}
