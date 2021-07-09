import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { Spinner, Container } from "reactstrap";

import { AuthContext } from "../context/auth";

export function AuthRoute({ children, ...rest }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Container className="text-center">
        <Spinner />
      </Container>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

export function AdminRoute({ children, ...rest }) {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) {
    return (
      <Container className="text-center">
        <Spinner />
      </Container>
    );
  }

  if (user.role === "basic") {
    logout();
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user && (user.role === "admin" || user.role === "supervisor") ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}
