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

import env from "dotenv";
import { I18nMiddleware } from "./middlewares/i18n-middleware";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import cors from "cors";
import { SectionResolver } from "./resolvers/section";
import { SubmissionResolver } from "./resolvers/submission";
import { AttendeeResolver } from "./resolvers/attendee";
import { InternshipResolver } from "./resolvers/internship";

env.config();

const port = process.env.PORT || 5000;
const mongooseUri = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

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
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      ConferencerResolver,
      SectionResolver,
      SubmissionResolver,
      AttendeeResolver,
      InternshipResolver,
    ],
    // use document converting middleware
    globalMiddlewares: [TypegooseMiddleware, I18nMiddleware],
    // use ObjectId scalar mapping
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    emitSchemaFile: true,
    container: Container,
    validate: true,
    authChecker,
  });

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
      origin: [
        `http://client:3000`,
        `http://client-staging:3000`,
        `http://localhost:3000`,
        `http://localhost:3001`,
      ],
    })
  );
  app.use(cookieParser());
  app.use(
    "/graphql",
    Express.json(),
    expressMiddleware(server, { context: async (ctx) => createContext(ctx) })
  );

  await mongoDbConnect();

  httpServer.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}/graphql`
    )
  );
}

main().catch((err) => console.log("MAIN ERROR, ", err));
