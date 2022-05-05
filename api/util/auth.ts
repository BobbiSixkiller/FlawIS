import { Request, Response, NextFunction } from "express";
import { verify, sign, SignOptions } from "jsonwebtoken";

import env from "dotenv";
import { RemoteGraphQLDataSource } from "@apollo/gateway";
import parseCookies from "./cookieParser";

env.config();

export interface Context {
	req: Request;
	res: Response;
	user: Object | null;
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

//Apollo context init with authorized user
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
