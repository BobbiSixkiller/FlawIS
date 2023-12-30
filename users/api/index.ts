import "reflect-metadata";
import Container from "typedi";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { connect } from "mongoose";

import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./util/scalars";
import { TypegooseMiddleware } from "./middlewares/typegoose-middleware";

import { UserResolver } from "./resolvers/user";

import { Context, createContext } from "./util/auth";
import { authChecker } from "./util/auth";
import Messagebroker from "./util/rmq";

import env from "dotenv";
import { initRedis } from "./util/redis";
import { I18nMiddleware } from "./middlewares/i18n-middleware";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloComplexityPlugin } from "./util/ApolloComplexityPlugin";

env.config();

const origins =
  process.env.NODE_ENV !== "staging"
    ? [
        `https://flawis.flaw.uniba.sk`,
        `https://conferences.flaw.uniba.sk`,
        `http://client:3000`,
        `http://localhost:3000`,
        `http://client13:3000`,
      ]
    : [
        `https://flawis-staging.flaw.uniba.sk`,
        `https://conferences-staging.flaw.uniba.sk`,
        // `http://client-staging:4000`,
        // `http://localhost-staging:4000`,
      ];
const port = process.env.PORT || 5000;
const mongooseUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/users";

async function mongoDbConnect() {
  try {
    const mongoose = await connect(mongooseUri);
    mongoose.set("strictQuery", false);
    console.log(mongoose.connection && "Database connected!");
  } catch (error) {
    console.error("Error in MongoDb connection: " + error);
    setTimeout(() => mongoDbConnect(), 15 * 1000);
  }
}

async function main() {
  //Build schema
  const schema = await buildSchema(
    {
      // orphanedTypes: [User],
      resolvers: [UserResolver],
      // use document converting middleware
      globalMiddlewares: [TypegooseMiddleware, I18nMiddleware],
      // use ObjectId scalar mapping
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
      emitSchemaFile: true,
      container: Container,
      validate: true,
      authChecker,
    }
    // {
    //   User: { __resolveReference: resolveUserReference },
    // }
  );

  const app = Express();

  // Trust the X-Forwarded-For header
  app.set("trust proxy", true);

  app.use(
    cors({
      credentials: true,
      origin: origins,
    })
  );
  app.use(cookieParser());

  //Create Apollo server
  const server = new ApolloServer({
    schema,
    context: (ctx) => createContext(ctx),
    plugins:
      process.env.NODE_ENV === "development"
        ? [
            ApolloServerPluginLandingPageGraphQLPlayground(),
            new ApolloComplexityPlugin(200),
          ]
        : [new ApolloComplexityPlugin(200)],
    csrfPrevention: process.env.NODE_ENV === "production" ? true : false,
    persistedQueries:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
        ? false
        : undefined,
  });

  await mongoDbConnect();
  await Messagebroker.init();
  initRedis();

  await server.start();

  server.applyMiddleware({ app, cors: false });

  app.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
    )
  );
}

main().catch((err) => console.log("MAIN ERROR, ", err));
