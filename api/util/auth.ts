import { Request, Response, NextFunction } from "express";
import { verify, sign, SignOptions } from "jsonwebtoken";

import env from "dotenv";

import FileUploadDataSource from "@profusion/apollo-federation-upload";
import { GraphQLRequestContext } from "apollo-server-types";
import parseCookies from "./cookieParser";
import { GraphQLDataSourceProcessOptions } from "@apollo/gateway";
import { User } from "./types";

env.config();

export interface Context {
	req: Request;
	res: Response;
	user: User | null;
}

export function signJwt(object: Object, options?: SignOptions | undefined) {
	return sign(object, process.env.SECRET || "JWT_SECRET", {
		...(options && options),
	});
}

export function verifyJwt<T>(token: string): T | null {
	try {
		const decoded = verify(token, process.env.SECRET || "JWT_SECRET") as T;
		return decoded;
	} catch (error) {
		console.log(error);
		return null;
	}
}

//Apollo context init with authenticated user
export function createContext(ctx: Context): Context {
	const context = ctx;

	if (context.req.cookies.accessToken) {
		const token = context.req.cookies.accessToken.split("Bearer%20")[1];
		if (token) {
			context.user = verifyJwt(token);
		} else
			throw new Error(
				"Authentication header format must be: 'Bearer [token]'."
			);
	}

	return context;
}

//express auth middleware for accessing public folder on file micro-service
export function isAuthMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (req.cookies.accessToken) {
		const token = req.cookies.accessToken.split("Bearer%20")[1];
		if (token) {
			const user = verifyJwt(token);
			if (user) return next();

			return res.status(401).send({ message: "Not authorized!" });
		} else
			return res.status(400).send({
				message: "Authentication header format must be: 'Bearer [token]'.",
			});
	}

	return res.status(401).send({ message: "Not authorized!" });
}

export class AuthenticatedDataSource extends FileUploadDataSource {
	didReceiveResponse({
		response,
		context,
	}: Required<
		Pick<
			GraphQLRequestContext<Record<string, any>>,
			"request" | "response" | "context"
		>
	>): typeof response {
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
	}

	willSendRequest({
		request,
		context,
	}: GraphQLDataSourceProcessOptions<Record<string, any>>) {
		if (context.user) {
			request.http?.headers.set("user", JSON.stringify(context.user));
		}
	}
}
