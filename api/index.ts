import "reflect-metadata";
import { ApolloGateway } from "@apollo/gateway";
import { ApolloServer } from "apollo-server-express";
import Express from "express";

import env from "dotenv";

env.config();

const main = async () => {
	const gateway = new ApolloGateway({
		serviceList: [{ name: "users", url: "http://localhost:5001" }],
	});

	const app = Express();

	const server = new ApolloServer({
		gateway,
	});

	await server.start();

	server.applyMiddleware({ app });

	app.listen({ port: process.env.PORT || 5000 }, () =>
		console.log(
			`🚀 Server ready and listening at ==> http://localhost:${
				process.env.PORT || 5000
			}${server.graphqlPath}`
		)
	);
};

main().catch(console.error);
