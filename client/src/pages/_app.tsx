import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";

import "semantic-ui-css/semantic.min.css";
import "./app.css";

import { useApollo } from "../lib/apollo";
import { AuthProvider } from "src/providers/Auth";
import ProtectedRouteProvider from "src/providers/ProtectedRoute";
import { appWithTranslation } from "next-i18next";
import { useEffect } from "react";

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps);

  const protect = pageProps.protect as boolean;

  const getLayout = Component.getLayout || ((page) => page);

  useEffect(() => {
    const storage = globalThis?.sessionStorage;
    if (!storage) return;
    // Set the previous path as the value of the current path.
    const prevHostPath = storage.getItem("currentPath");
    storage.setItem("prevHostPath", prevHostPath);
    // Set the current path value by looking at the browser's location object.
    storage.setItem(
      "currentHostPath",
      globalThis.location.hostname + globalThis.location.pathname
    );
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <ProtectedRouteProvider protect={protect}>
          {getLayout(<Component {...pageProps} />)}
        </ProtectedRouteProvider>
      </AuthProvider>
    </ApolloProvider>
  );
};

export default appWithTranslation(App);
