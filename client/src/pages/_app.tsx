import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";

import "semantic-ui-css/semantic.min.css";
import "./app.css";

import { useApollo } from "../lib/apollo";
import { appWithTranslation } from "next-i18next";

import { AuthProvider } from "../providers/Auth";
import ProtectedRouteProvider from "../providers/ProtectedRoute";
import { useRouter } from "next/router";
import { useEffect } from "react";

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps);
  const router = useRouter();

  const protect = pageProps.protect as boolean;

  const getLayout = Component.getLayout || ((page) => page);

  useEffect(() => storePathValues, [router.asPath]);

  function storePathValues() {
    const storage = globalThis?.sessionStorage;
    if (!storage) return;
    // Set the previous path as the value of the current path.
    const prevPath = storage.getItem("currentPath") || "";
    storage.setItem("prevPath", prevPath);
    // Set the current path value by looking at the browser's location object.
    storage.setItem("currentPath", globalThis.location.pathname);
  }

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
