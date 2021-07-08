import React, { useState, useEffect, useRef } from "react";
import { useRouteMatch, useLocation, Link } from "react-router-dom";

import { useDataFetch } from "../../hooks/useApi";

import { Input, Spinner, ListGroup, ListGroupItem } from "reactstrap";

export default function GrantApiSearch() {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();

  const [display, setDisplay] = useState(false);
  const [search, setSearch] = useState("");

  const autoWrapRef = useRef(null);
  const activeSuggestionRef = useRef(null);

  const { loading, error, data, setUrl } = useDataFetch(
    `grant/api/search?q=${search}`,
    []
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [autoWrapRef]);

  useEffect(() => {
    setUrl(`grant/api/search?q=${search}`);
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
      <Input
        className="autoInput"
        id="search"
        name="search"
        placeholder="Hľadať..."
        value={search}
        onClick={() => setDisplay(!display)}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
      />
      {display && (
        <ListGroup className="suggestions">
          {loading && (
            <ListGroupItem>
              <Spinner size="sm" />
            </ListGroupItem>
          )}
          {data.grants.length === 0 || error ? (
            <ListGroupItem className="text-muted">
              Žiadne výsledky
            </ListGroupItem>
          ) : (
            data.grants.map((grant) => (
              <ListGroupItem
                key={grant._id}
                onClick={() => setDisplay(false)}
                tag={Link}
                to={`${url}/${grant._id}`}
                action
                active={activeSuggestionRef.current === grant._id}
              >
                {grant.name}, {grant.idNumber}
              </ListGroupItem>
            ))
          )}
        </ListGroup>
      )}
    </div>
  );
}
