import { Request, Response, NextFunction } from "express";
import { verify, sign, SignOptions } from "jsonwebtoken";

import env from "dotenv";

// import FileUploadDataSource from "@profusion/apollo-federation-upload";
import { GraphQLRequest, GraphQLRequestContext } from "apollo-server-types";
import parseCookies from "./cookieParser";
import { User } from "./types";
import { ExpressContext } from "apollo-server-express";
import FileUploadDataSource from "./test";

env.config();

export interface Context {
	req: Request;
	res: Response;
	user: User | null;
	locale: string;
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
export function createContext({ req, res }: ExpressContext): Context {
	const appContext: Context = {
		req,
		res,
		locale: req.cookies.NEXT_LOCALE,
		user: null,
	};

	if (req.cookies.accessToken) {
		const token = req.cookies.accessToken.split("Bearer%20")[1];
		if (token) {
			appContext.user = verifyJwt(token);
		} else
			throw new Error(
				"Authentication header format must be: 'Bearer [token]'."
			);
	}

	return appContext;
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
	}: {
		request: GraphQLRequest;
		context: any;
	}) {
		if (context.user) {
			request.http?.headers.set("user", JSON.stringify(context.user));
		}
		if (context.locale) {
			request.http?.headers.set("locale", JSON.stringify(context.locale));
		}

		//rest of the headers i.e. reset token
		// const headers = context.req?.headers;
		// for (const key in headers) {
		// 	const value = headers[key];
		// 	if (value) {
		// 		request.http?.headers.set(key, String(value));
		// 	}
		// }

		// console.log(request.http?.headers);
	}
}
