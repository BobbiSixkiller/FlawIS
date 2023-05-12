import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import Express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import { buildFederatedSchema } from "./util/buildFederatedSchema";

import { FileResolver } from "./resolvers.ts/file";
import { Context, authChecker } from "./util/auth";

import env from "dotenv";
import Messagebroker from "./util/rmq";
import { connect } from "mongoose";
import { ObjectId } from "mongodb";
import { TypegooseMiddleware } from "./middlewares/typegoose-middleware";
import User from "./entities/File";
import { ObjectIdScalar } from "./util/scalars";

env.config();

const port = process.env.PORT || 5002;
const mongooseUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/FLAWIS-files";

async function main() {
  //Build schema
  const schema = await buildFederatedSchema({
    resolvers: [FileResolver],
    orphanedTypes: [User],
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    globalMiddlewares: [TypegooseMiddleware],
    emitSchemaFile: true,
    authChecker,
  });

  const app = Express();

  app.use(graphqlUploadExpress());
  app.use("/public", Express.static("./public"));

  //Create Apollo server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }: Context) => ({
      req,
      res,
      user: req.headers.user
        ? JSON.parse(decodeURIComponent(req.headers.user as string))
        : null,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    // csrfPrevention: process.env.NODE_ENV === "production" ? true : false,
    persistedQueries: process.env.NODE_ENV === "production" ? false : undefined,
  });

  await Messagebroker.init();
  const mongoose = await connect(mongooseUri);
  mongoose.set("strictQuery", false);
  console.log(mongoose.connection && "Database connected!");

  await server.start();

  server.applyMiddleware({ app });

  app.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
    )
  );
}

main().catch(console.error);
