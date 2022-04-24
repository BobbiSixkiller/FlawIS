import "reflect-metadata";
import { ApolloGateway, RemoteGraphQLDataSource } from "@apollo/gateway";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import Express from "express";
import cookieParser from "cookie-parser";
//import cors from "cors";

import env from "dotenv";
import { ApolloComplexityPlugin } from "./util/ApolloComplexityPlugin";
import { Context, createContext } from "./util/auth";
import parseCookies from "./util/cookieParser";

env.config();

const main = async () => {
	const gateway = new ApolloGateway({
		serviceList: [{ name: "users", url: "http://localhost:5001" }],
		buildService({ name, url }) {
			return new RemoteGraphQLDataSource({
				url,
				willSendRequest({ request, context }) {
					if (context.user) {
						request.http?.headers.set("user", JSON.stringify(context.user));
					}
				},
				didReceiveResponse({ response, context }): typeof response {
					const rawCookies = response.http?.headers.get("set-cookie") as
						| string
						| null;

					if (rawCookies) {
						const cookies = parseCookies(rawCookies);
						cookies.forEach(({ cookieName, cookieValue, options }) => {
							if (context && context.res) {
								context.res.cookie(cookieName, cookieValue, { ...options });
							}
						});
					}

					return response;
				},
			});
		},
	});

	const app = Express();

	app.use(cookieParser());
	// app.use(
	// 	cors({
	// 		origin: [
	// 			"http://localhost:3000",
	// 		],
	// 		credentials: true,
	// 	})
	// );

	const server = new ApolloServer({
		gateway,
		context: (ctx: Context) => createContext(ctx),
		plugins: [
			ApolloServerPluginLandingPageGraphQLPlayground,
			new ApolloComplexityPlugin(1000),
		],
	});

	await server.start();

	server.applyMiddleware({ app, cors: false });

	app.listen({ port: process.env.PORT || 5000 }, () =>
		console.log(
			`🚀 Server ready and listening at ==> http://localhost:${
				process.env.PORT || 5000
			}${server.graphqlPath}`
		)
	);
};

main().catch(console.error);
