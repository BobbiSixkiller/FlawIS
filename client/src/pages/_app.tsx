import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";

import "semantic-ui-css/semantic.min.css";
import "./app.css";

import { useApollo } from "../lib/apollo";
import { appWithTranslation } from "next-i18next";

import { AuthProvider } from "../providers/Auth";
import ProtectedRouteProvider from "../providers/ProtectedRoute";

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps);

  const protect = pageProps.protect as boolean;

  const getLayout = Component.getLayout || ((page) => page);

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
