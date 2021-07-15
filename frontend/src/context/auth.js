import React, { useEffect, useReducer, createContext } from "react";

import API from "../api";

const AuthContext = createContext({
  user: null,
  login: function (data) {},
  logout: function () {},
});

function authReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        loading: true,
        error: false,
        msg: "",
      };
    case "SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        error: false,
        msg: action.payload.msg,
      };
    case "FAILURE":
      return {
        ...state,
        loading: false,
        user: null,
        error: true,
        msg: action.payload.msg,
      };
    case "HIDE_MSG":
      return {
        ...state,
        msg: null,
      };

    default:
      return { ...state };
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    loading: true,
    user: null,
    error: false,
    msg: "",
  });

  useEffect(() => {
    async function currentUser() {
      dispatch({ type: "INIT" });
      try {
        const res = await API.get("user/me");
        dispatch({ type: "SUCCESS", payload: res.data });
      } catch (error) {
        console.log(error.response);
        dispatch({ type: "FAILURE", payload: {} });
      }
    }

    currentUser();
  }, []);

  async function register(data) {
    dispatch({ type: "INIT" });
    try {
      const res = await API.post("user/register", data);
      dispatch({ type: "SUCCESS", payload: res.data });
    } catch (err) {
      dispatch({ type: "FAILURE", payload: err.response.data });
    }
  }

  async function login(data) {
    dispatch({ type: "INIT" });
    try {
      const res = await API.post("user/login", data);
      dispatch({ type: "SUCCESS", payload: res.data });
    } catch (err) {
      dispatch({ type: "FAILURE", payload: err.response.data });
    }
  }

  async function logout() {
    const res = await API.get("user/logout");
    dispatch({ type: "SUCCESS", payload: res.data });
  }

  function hideMsg() {
    dispatch({ type: "HIDE_MSG" });
  }

  return (
    <AuthContext.Provider
      value={{
        loading: state.loading,
        user: state.user,
        error: state.error,
        msg: state.msg,
        register,
        login,
        logout,
        hideMsg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
