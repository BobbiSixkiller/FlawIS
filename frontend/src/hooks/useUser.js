import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

async function getCurrentUser(accessToken) {
  try {
    const res = await api.get("user/me", {
      headers: {
        authToken: accessToken
      }
    });
    return res.data;
  } catch(err) {
    return err.response.data;
  } 
}

const initialState = {
  user: {},
  accessToken: undefined,
  loading: false
};

const UserContext = createContext(initialState);

export function UserProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function handleAccessTokenChange() {
    if (!user._id && accessToken) {
      setLoading(true);
      localStorage.setItem('authToken', accessToken);
      const user = await getCurrentUser(accessToken);
      setUser(user);
      setLoading(false);
    } else if (!accessToken) {
      // Log Out
      localStorage.removeItem('authToken');
      setUser({});
      setLoading(false);
    }
  }

  useEffect(() => {
    handleAccessTokenChange();
  }, [accessToken]);

  return (
    <UserContext.Provider value={{ user, loading, accessToken, setAccessToken, search, setSearch }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
