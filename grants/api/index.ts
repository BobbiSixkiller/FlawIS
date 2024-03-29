import "reflect-metadata";
import Container from "typedi";
import { ApolloServer } from "apollo-server";
import { connect } from "mongoose";
import { ObjectId } from "mongodb";

import { ObjectIdScalar } from "./util/scalars";
import { TypegooseMiddleware } from "./middlewares/typegoose-middleware";
import { buildFederatedSchema } from "./util/buildFederatedSchema";
import { Context } from "./util/auth";
import { authChecker } from "./util/auth";

import { GrantResolver } from "./resolvers/grant";
import { MemberResolver } from "./resolvers/member";
import { UserResolver } from "./resolvers/user";
import { resolveUserReference } from "./resolvers/resolveUserReference";

import env from "dotenv";
import MessageBroker from "./util/rmq";
import { AnnouncementResolver } from "./resolvers/announcement";
import { Grant } from "./entitites/Grant";
import { User } from "./entitites/User";
import { Announcement } from "./entitites/Announcement";

env.config();

const port = process.env.PORT || 5004;
const mongooseUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/grants";

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
      // orphanedTypes: [Grant, User, Announcement],
      resolvers: [
        GrantResolver,
        MemberResolver,
        UserResolver,
        AnnouncementResolver,
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

  // await initRedis();

  await server.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
    )
  );
}

main().catch(console.error);
