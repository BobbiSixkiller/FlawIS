import "reflect-metadata";
import Container from "typedi";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { connect } from "mongoose";

import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./util/scalars";
import { TypegooseMiddleware } from "./middlewares/typegoose-middleware";

import { UserResolver } from "./resolvers/user";

import { resolveUserReference } from "./resolvers/resolveUserReference";
import { buildFederatedSchema } from "./util/buildFederatedSchema";

import { Context } from "./util/auth";
import { authChecker } from "./util/auth";
import Messagebroker from "./util/rmq";

import env from "dotenv";
import { initRedis } from "./util/redis";

env.config();

const port = process.env.PORT || 5001;
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
  const schema = await buildFederatedSchema(
    {
      // orphanedTypes: [User],
      resolvers: [UserResolver],
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

  const app = Express();

  // Trust the X-Forwarded-For header
  app.set("trust proxy", true);

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
  await Messagebroker.init();
  await initRedis();

  await server.start();

  server.applyMiddleware({ app });

  app.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
    )
  );
}

main().catch((err) => console.log("MAIN ERROR, ", err));
