import "reflect-metadata";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import Express from "express";
import cookieParser from "cookie-parser";

import { ApolloComplexityPlugin } from "./util/ApolloComplexityPlugin";
import {
	AuthenticatedDataSource,
	Context,
	createContext,
	isAuthMiddleware,
} from "./util/auth";
import { createProxyMiddleware } from "http-proxy-middleware";

import env from "dotenv";

env.config();

const main = async () => {
	const gateway = new ApolloGateway({
		supergraphSdl: new IntrospectAndCompose({
			subgraphs: [
				{ name: "users", url: "http://localhost:5001/graphql" },
				{ name: "files", url: "http://localhost:5002/graphql" },
				{ name: "conferences", url: "http://localhost:5003/graphql" },
			],
		}),
		buildService({ name, url }) {
			return new AuthenticatedDataSource({ url });
		},
	});

	const app = Express();

	app.use(cookieParser());
	app.use(graphqlUploadExpress());
	app.use(
		"/public",
		isAuthMiddleware,
		createProxyMiddleware({
			target: "http://localhost:5002/",
			changeOrigin: false,
		})
	);

	const server = new ApolloServer({
		gateway,
		context: (ctx: Context) => createContext(ctx),
		plugins: [
			ApolloServerPluginLandingPageGraphQLPlayground,
			new ApolloComplexityPlugin(100),
		],
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
