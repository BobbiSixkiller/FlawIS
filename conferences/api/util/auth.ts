import { Request, Response } from "express";
import { verify, sign, SignOptions } from "jsonwebtoken";

import env from "dotenv";
import { AuthChecker } from "type-graphql";
import { User } from "./types";

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
  if (roles.some((role) => user.role === role)) return true;

  //check if user permissions property contains some defined role
  if (roles.some((role) => role === "IS_OWN_USER"))
    return args.id.toString() === user.id;

  //no roles matched
  return false;
};
