import "reflect-metadata";
import Container from "typedi";
import { ApolloServer } from "apollo-server";
import { connect } from "mongoose";

import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./util/scalars";
import { TypegooseMiddleware } from "./util/typegoose-middleware";

import { UserResolver } from "./resolvers/user";

import { resolveUserReference } from "./resolvers/resolveUserReference";
import { buildFederatedSchema } from "./util/buildFederatedSchema";

import { Context } from "./util/auth";
import { authChecker } from "./util/auth";
import Messagebroker from "./services/messageBroker";

import env from "dotenv";

env.config();

async function main() {
  //Build schema
  const schema = await buildFederatedSchema(
    {
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

  //Create Apollo server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }: Context) => ({
      req,
      res,
      user: req.headers.user ? JSON.parse(req.headers.user as string) : null,
      locale: req.headers.locale
        ? JSON.parse(req.headers.locale as string)
        : "sk",
    }),
  });

  // create mongoose connection
  const mongoose = await connect(
    process.env.DB || "mongodb://localhost:27017/users"
  );
  console.log(mongoose.connection && "Database connected!");

  await Messagebroker.init();
  Messagebroker.consumeMessages(["user.update.billings"]);

  await server.listen({ port: process.env.PORT || 5001 }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${
        process.env.PORT || 5001
      }${server.graphqlPath}`
    )
  );
}

main().catch(console.error);
