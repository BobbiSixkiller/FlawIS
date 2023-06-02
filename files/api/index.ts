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
import { ObjectIdScalar } from "./util/scalars";
import { resolveFileReference } from "./resolvers.ts/resolveFileReference";

env.config();

const port = process.env.PORT || 5002;
const mongooseUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/files";

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
      // orphanedTypes: [User, File],
      resolvers: [FileResolver],
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
      globalMiddlewares: [TypegooseMiddleware],
      emitSchemaFile: true,
      authChecker,
    },
    {
      File: { __resolveReference: resolveFileReference },
    }
  );

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
    persistedQueries:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
        ? false
        : undefined,
  });

  await mongoDbConnect();
  await Messagebroker.init();

  await server.start();

  server.applyMiddleware({ app });

  app.listen({ port }, () =>
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
    )
  );
}

main().catch(console.error);
