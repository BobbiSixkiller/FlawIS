import { useReducer, useState, useEffect, useContext } from "react";
import API from "../api";

import { AuthContext } from "../context/auth";

function apiReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { ...state, loading: true, error: false };
    case "SUCCESS":
      return { ...state, loading: false, error: false, data: action.payload };
    case "FAILURE":
      return { ...state, loading: false, error: true, data: action.payload };
    case "HIDE_MSG":
      return { ...state, data: null };
    default:
      return { ...state };
  }
}

export function useDataFetch(initUrl, initData) {
  const { logout } = useContext(AuthContext);
  const [url, setUrl] = useState(initUrl);
  const [refresh, setRefresh] = useState(false);

  const [state, dispatch] = useReducer(apiReducer, {
    loading: false,
    error: false,
    data: initData,
  });

  useEffect(() => {
    let cancel = false;

    async function fetchData() {
      dispatch({ type: "INIT" });

      try {
        const res = await API.get(url);
        if (!cancel) {
          dispatch({ type: "SUCCESS", payload: res.data });
        }
      } catch (err) {
        if (!cancel) {
          if (err.response.status === 401) {
            logout();
          } else dispatch({ type: "FAILURE", payload: err.response.data });
        }
      }
    }

    fetchData();
    return () => (cancel = true);
  }, [url, refresh, logout]);

  function refreshData() {
    setRefresh(!refresh);
  }

  return {
    ...state,
    setUrl,
    refreshData,
  };
}

export function useDataSend() {
  const { logout } = useContext(AuthContext);

  const [state, dispatch] = useReducer(apiReducer, {
    loadig: false,
    error: false,
    data: null,
  });

  async function sendData(url, method, data, headers) {
    dispatch({ type: "INIT" });
    try {
      const res = await API.request({ url, method, data, headers });
      dispatch({ type: "SUCCESS", payload: res.data });
    } catch (err) {
      if (err.response.status === 401) {
        logout();
      } else dispatch({ type: "FAILURE", payload: err.response.data });
    }
  }

  function hideMessage() {
    dispatch({ type: "HIDE_MSG" });
  }

  return { ...state, sendData, hideMessage };
}
