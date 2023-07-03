import type { NextPage } from "next";
import { ApolloProvider } from "@apollo/client";

import "semantic-ui-css/semantic.min.css";
import "./app.css";

import { useApollo } from "../lib/apollo";
import { appWithTranslation } from "next-i18next";

import { AuthProvider } from "../providers/Auth";
import ProtectedRouteProvider from "../providers/ProtectedRoute";
import { ReactElement, ReactNode } from "react";
import { AppProps } from "next/app";
import { ControlsProvider } from "../providers/ControlsProvider";
import { DialogProvider } from "../providers/Dialog";
import UserVerifiedDialog from "../components/UserVerifiedDialog";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App: NextPage<AppPropsWithLayout> = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps);

  const protect = pageProps.protect as boolean;

  const getLayout = Component.getLayout || ((page) => page);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <ProtectedRouteProvider protect={protect}>
          <ControlsProvider>
            <DialogProvider>
              <UserVerifiedDialog />
              {getLayout(<Component {...pageProps} />)}
            </DialogProvider>
          </ControlsProvider>
        </ProtectedRouteProvider>
      </AuthProvider>
    </ApolloProvider>
  );
};

export default appWithTranslation(App);
