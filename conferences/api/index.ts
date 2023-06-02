import "reflect-metadata";
import Container from "typedi";
import { ApolloServer } from "apollo-server";
import { connect } from "mongoose";

import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./util/scalars";
import { TypegooseMiddleware } from "./middlewares/typegoose-middleware";

import { ConferenceResolver } from "./resolvers/conference";

import { buildFederatedSchema } from "./util/buildFederatedSchema";

import { Context } from "./util/auth";
import { authChecker } from "./util/auth";
import MessageBroker from "./util/rmq";

import { AttendeeResolver } from "./resolvers/attendee";
import { SectionResolver } from "./resolvers/section";
import { SubmissionResolver } from "./resolvers/submission";
import { resolveUserReference } from "./resolvers/resolveUserReference";

import env from "dotenv";
import { User } from "./entities/User";
import File from "./entities/File";
import { Conference } from "./entities/Conference";
import { Submission } from "./entities/Submission";

env.config();

const port = process.env.PORT || 5003;
const mongooseUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/conferences";

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
  const schema = await buildFederatedSchema(
    {
      // orphanedTypes: [User, File, Conference, Submission],
      resolvers: [
        ConferenceResolver,
        SectionResolver,
        SubmissionResolver,
        AttendeeResolver,
      ],
      // use document converting middleware
      globalMiddlewares: [TypegooseMiddleware],
      // use ObjectId scalar mapping
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
      emitSchemaFile: true,
      container: Container,
      //disabled validation for dev purposes
      //validate: false,
      authChecker,
    },
    {
      User: { __resolveReference: resolveUserReference },
    }
  );

  //Create Apollo server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }: Context) => ({
      req,
      res,
      user: req.headers.user
        ? JSON.parse(decodeURIComponent(req.headers.user as string))
        : null,
      locale: req.headers.locale
        ? JSON.parse(decodeURIComponent(req.headers.locale as string))
        : "sk",
    }),
    csrfPrevention: process.env.NODE_ENV === "production" ? true : false,
    persistedQueries:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
        ? false
        : undefined,
  });

  await mongoDbConnect();
  await MessageBroker.init();

  await server.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
    )
  );
}

main().catch(console.error);
