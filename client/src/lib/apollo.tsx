import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { onError } from "@apollo/link-error";
import { createUploadLink } from "apollo-upload-client";
import merge from "deepmerge";
import { IncomingHttpHeaders } from "http";
import fetch from "isomorphic-unfetch";
import isEqual from "lodash/isEqual";
import { AppProps } from "next/app";
import { useMemo } from "react";

const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/graphql";
const BACKEND_SERVICE_NAME = BACKEND_URL.includes("staging")
  ? "http://gateway-staging:6000/graphql"
  : "http://gateway:5000/graphql";

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

const createApolloClient = (headers: IncomingHttpHeaders | null = null) => {
  // isomorphic fetch for passing the cookies along with each GraphQL request
  const enhancedFetch = (url: RequestInfo, init: RequestInit) => {
    return fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        "Access-Control-Allow-Origin": "*",
        // here we pass the cookie along for each request
        Cookie: headers?.cookie ?? "",
      },
    }).then((response) => response);
  };

  return new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === "production" ? false : true,
    // SSR only for Node.js
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) => {
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
          });

        if (networkError)
          console.log(
            `[Network error]: ${networkError}. Backend is unreachable. Is it running?`
          );
      }),
      // this uses apollo-link-http under the hood, so all the options here come from that package
      createUploadLink({
        uri: typeof window === "undefined" ? BACKEND_SERVICE_NAME : BACKEND_URL,
        // Make sure that CORS and cookies work
        fetchOptions: {
          mode: "cors",
        },
        credentials: "include",
        fetch: enhancedFetch,
      }),
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        Conference: { fields: { attendees: relayStylePagination() } },
        Query: {
          fields: {
            grants: relayStylePagination(),
            announcements: relayStylePagination(),
            users: relayStylePagination(),
            conferences: {
              keyArgs: false,
              // While args.cursor may still be important for requesting
              // a given page, it no longer has any role to play in the
              // merge function.
              merge(existing = {}, incoming) {
                const cache = { ...existing };
                if (cache.edges === undefined) return incoming;

                cache.edges = [...cache.edges, ...incoming.edges];
                cache.pageInfo = incoming.pageInfo;
                cache.year = incoming.year;

                return cache;
              },
              // Return all items stored so far, to avoid ambiguities
              // about the order of the items.
              // read(existing) {
              //   return existing && Object.values(existing);
              // },
            },
          },
        },
      },
    }),
  });
};

type InitialState = NormalizedCacheObject | undefined;

interface IInitializeApollo {
  headers?: IncomingHttpHeaders | null;
  initialState?: InitialState | null;
}

export const initializeApollo = (
  { headers, initialState }: IInitializeApollo = {
    headers: null,
    initialState: null,
  }
) => {
  const _apolloClient = apolloClient ?? createApolloClient(headers);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
};

export const addApolloState = (
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: AppProps["pageProps"]
) => {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
};

export function useApollo(pageProps: AppProps["pageProps"]) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(
    () => initializeApollo({ initialState: state }),
    [state]
  );
  return store;
}
