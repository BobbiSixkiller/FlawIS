import "reflect-metadata";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "apollo-server-express";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";

import { ApolloComplexityPlugin } from "./util/ApolloComplexityPlugin";
import {
  AuthenticatedDataSource,
  createContext,
  isAuthMiddleware,
} from "./util/auth";
import waitForServices from "./util/waitForServices";

import env from "dotenv";

env.config();

const port = process.env.PORT || 5000;
const services =
  process.env.NODE_ENV !== "staging"
    ? [
        { name: "users", url: "http://users:5001/graphql" },
        { name: "files", url: "http://files:5002/graphql" },
        {
          name: "conferences",
          url: "http://conferences:5003/graphql",
        },
        { name: "grants", url: "http://grants:5004/graphql" },
      ]
    : [
        { name: "users-staging", url: "http://users-staging:6001/graphql" },
        { name: "files-staging", url: "http://files-staging:6002/graphql" },
        {
          name: "conferences-staging",
          url: "http://conferences-staging:6003/graphql",
        },
        { name: "grants-staging", url: "http://grants-staging:6004/graphql" },
      ];
const origins =
  process.env.NODE_ENV !== "staging"
    ? [
        `https://flawis.flaw.uniba.sk`,
        `https://conferences.flaw.uniba.sk`,
        `http://client:3000`,
        `http://localhost:3000`,
      ]
    : [
        `https://flawis-staging.flaw.uniba.sk`,
        `https://conferences-staging.flaw.uniba.sk`,
        `http://client-staging:4000`,
        `http://localhost-staging:4000`,
      ];

const main = async () => {
  await waitForServices(services);

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: services,
    }),
    buildService({ url }) {
      return new AuthenticatedDataSource({ url });
    },
  });

  const app = Express();

  app.use(
    cors({
      credentials: true,
      origin: origins,
    })
  );
  app.use(cookieParser());
  app.use(graphqlUploadExpress());
  app.use(
    "/public/submissions",
    isAuthMiddleware,
    createProxyMiddleware({
      target:
        process.env.NODE_ENV !== "staging"
          ? "http://files:5002/"
          : "http://files-staging:6002/",
      changeOrigin: true,
    })
  );
  app.use(
    "/public/grants",
    isAuthMiddleware,
    createProxyMiddleware({
      target:
        process.env.NODE_ENV !== "staging"
          ? "http://files:5002/"
          : "http://files-staging:6002/",
      changeOrigin: true,
    })
  );
  app.use(
    "/public",
    cors(),
    createProxyMiddleware({
      target:
        process.env.NODE_ENV !== "staging"
          ? "http://files:5002/"
          : "http://files-staging:6002/",
      changeOrigin: true,
    })
  );

  const server = new ApolloServer({
    gateway,
    context: (ctx) => createContext(ctx),
    plugins: [
      process.env.NODE_ENV === "development"
        ? ApolloServerPluginLandingPageGraphQLPlayground()
        : null,
      new ApolloComplexityPlugin(200),
    ],
    // csrfPrevention: process.env.NODE_ENV === "production" ? true : false,
    persistedQueries:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
        ? false
        : undefined,
  });

  await server.start();

  server.applyMiddleware({ app, cors: false });

  app.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
    )
  );
};

main().catch(console.error);
