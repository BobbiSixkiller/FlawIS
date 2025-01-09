import { Request, Response } from "express";
import { verify, sign, SignOptions } from "jsonwebtoken";

import { AuthChecker } from "type-graphql";
import { User } from "./types";

import env from "dotenv";
import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";

env.config();

export interface Context {
  req: Request;
  res: Response;
  user: User | null;
  locale: string;
}

export function createContext({
  req,
  res,
}: ExpressContextFunctionArgument): Context {
  const appContext: Context = {
    req: req as Request,
    res: res as Response,
    locale: req.cookies.NEXT_locale,
    user: null,
  };

  if (req.cookies.accessToken) {
    const token = req.cookies.accessToken.split("Bearer ")[1];
    if (token) {
      appContext.user = verifyJwt(token);
    } else
      throw new Error(
        "Authentication header format must be: 'Bearer [token]'."
      );
  }

  return appContext;
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

export const authChecker: AuthChecker<Context> = (
  { args, context: { user } },
  roles
) => {
  //checks for user inside the context
  if (roles.length === 0) {
    return user !== null;
  }
  //roles exists but no user in the context
  if (!user) return false;

  //check if user role matches the defined role
  if (roles.some((role) => user.access.includes(role))) return true;

  //no roles matched
  return false;
};
