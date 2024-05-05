import "reflect-metadata";
import Container from "typedi";
import http from "http";
import Express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { connect } from "mongoose";

import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./util/scalars";
import { TypegooseMiddleware } from "./middlewares/typegoose-middleware";

import { UserResolver } from "./resolvers/user";
import { ConferencerResolver } from "./resolvers/conference";

import { createContext } from "./util/auth";
import { authChecker } from "./util/auth";
import Messagebroker from "./util/rmq";

import env from "dotenv";
import { initRedis } from "./util/redis";
import { I18nMiddleware } from "./middlewares/i18n-middleware";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import cors from "cors";
import { SectionResolver } from "./resolvers/section";
import { SubmissionResolver } from "./resolvers/submission";
import { AttendeeResolver } from "./resolvers/attendee";

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
      resolvers: [
        UserResolver,
        ConferencerResolver,
        SectionResolver,
        SubmissionResolver,
        AttendeeResolver,
      ],
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
  const httpServer = http.createServer(app);

  //Create Apollo server
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    csrfPrevention: process.env.NODE_ENV === "production" ? true : false,
    persistedQueries:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
        ? false
        : undefined,
  });
  await server.start();

  // Trust the X-Forwarded-For header
  app.set("trust proxy", true);
  app.use(
    cors({
      credentials: true,
      origin: origins,
    })
  );
  app.use(cookieParser());
  app.use(
    "/graphql",
    Express.json(),
    expressMiddleware(server, { context: async (ctx) => createContext(ctx) })
  );

  await mongoDbConnect();
  await Messagebroker.init();
  initRedis();

  httpServer.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}/graphql`
    )
  );
}

main().catch((err) => console.log("MAIN ERROR, ", err));
