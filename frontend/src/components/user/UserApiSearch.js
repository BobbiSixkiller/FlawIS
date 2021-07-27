import React, { useState, useEffect, useRef } from "react";
import { useRouteMatch, useLocation, Link } from "react-router-dom";
import { useField } from "formik";

import { useDataFetch } from "../../hooks/useApi";

import {
  Label,
  Input,
  FormFeedback,
  Spinner,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

export default function ApiSearch({ label, ...props }) {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const [field, meta, helpers] = useField(props);

  const [display, setDisplay] = useState(false);
  const [search, setSearch] = useState("");
  const autoWrapRef = useRef(null);
  const activeSuggestionRef = useRef(null);

  const { loading, error, data, setUrl } = useDataFetch(
    `user/api/search?q=${search}`,
    []
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [autoWrapRef]);

  useEffect(() => {
    setUrl(`user/api/search?q=${search}`);
  }, [search, setUrl]);

  useEffect(() => {
    activeSuggestionRef.current = pathname.split("/")[3];
  }, [pathname]);

  function handleClickOutside(e) {
    if (autoWrapRef.current && !autoWrapRef.current.contains(e.target)) {
      setDisplay(false);
    }
  }

  return (
    <div ref={autoWrapRef}>
      {label && <Label>{label}</Label>}
      <Input
        className="autoInput"
        id="search"
        name="search"
        placeholder="Hľadať..."
        value={search}
        onClick={() => setDisplay(!display)}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
        invalid={meta.touched && meta.error && true}
        valid={meta.touched && !meta.error && true}
      />
      {meta && (
        <>
          <FormFeedback invalid="true">{meta.error}</FormFeedback>
          <FormFeedback valid>{label} OK!</FormFeedback>
        </>
      )}
      {display && (
        <ListGroup className="suggestions">
          {loading && (
            <ListGroupItem>
              <Spinner size="sm" />
            </ListGroupItem>
          )}
          {data.users.length === 0 || error ? (
            <ListGroupItem className="text-muted">
              Žiadne výsledky
            </ListGroupItem>
          ) : (
            data.users.map((user, i) =>
              field ? (
                <ListGroupItem
                  key={i}
                  onClick={() => {
                    helpers.setValue(user._id);
                    setSearch(user.fullName);
                    setDisplay(false);
                  }}
                  action
                  active={activeSuggestionRef.current === user._id}
                >
                  {user.fullName}, {user.email}
                </ListGroupItem>
              ) : (
                <ListGroupItem
                  key={i}
                  onClick={() => setDisplay(false)}
                  tag={Link}
                  to={`${url}/${user._id}`}
                  action
                  active={activeSuggestionRef.current === user._id}
                >
                  {user.fullName}, {user.email}
                </ListGroupItem>
              )
            )
          )}
        </ListGroup>
      )}
    </div>
  );
}
