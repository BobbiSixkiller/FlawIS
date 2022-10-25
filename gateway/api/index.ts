import "reflect-metadata";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { ApolloComplexityPlugin } from "./util/ApolloComplexityPlugin";
import {
  AuthenticatedDataSource,
  createContext,
  isAuthMiddleware,
} from "./util/auth";
import { createProxyMiddleware } from "http-proxy-middleware";

import env from "dotenv";

env.config();

const port = process.env.PORT || 5000;

const main = async () => {
  console.log("ZEBRO");
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: "users", url: "http://users:5001" },
        { name: "files", url: "http://files:5002" },
        { name: "conferences", url: "http://conferences:5003" },
        { name: "grants", url: "http://grants:5004" },
        // { name: "users", url: "http://localhost:5001/graphql" },
        // { name: "files", url: "http://localhost:5002/graphql" },
        // { name: "conferences", url: "http://localhost:5003/graphql" },
        // { name: "grants", url: "http://localhost:5004/graphql" },
      ],
    }),
    buildService({ url }) {
      return new AuthenticatedDataSource({ url });
    },
  });

  const app = Express();

  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000"],
    })
  );
  app.use(cookieParser());
  app.use(graphqlUploadExpress());
  app.use(
    "/public/submissions",
    isAuthMiddleware,
    createProxyMiddleware({
      target: "http://localhost:5002/public/submissions",
      changeOrigin: false,
    })
  );
  app.use(
    "/public",
    createProxyMiddleware({
      target: "http://localhost:5002/",
      changeOrigin: false,
    })
  );

  const server = new ApolloServer({
    gateway,
    context: (ctx) => createContext(ctx),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground,
      new ApolloComplexityPlugin(100),
    ],
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
