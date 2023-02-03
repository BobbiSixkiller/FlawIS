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

env.config();

const port = process.env.PORT || 5002;

async function main() {
	//Build schema
	const schema = await buildFederatedSchema({
		resolvers: [FileResolver],
		globalMiddlewares: [],
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
			user: req.headers.user ? req.headers.user : null,
			locale: req.headers.locale ? req.headers.locale : "sk",
		}),
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
	});

	await Messagebroker.init();
	Messagebroker.consumeMessages(["file.delete"])

	await server.start();

	server.applyMiddleware({ app });

	app.listen({ port }, () =>
		console.log(
			`🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
		)
	);
}

main().catch((error) => {
	console.log(error, "error");
});
