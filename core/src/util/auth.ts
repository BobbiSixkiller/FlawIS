import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { verify, sign, SignOptions } from "jsonwebtoken";
import { ObjectId } from "mongodb";

import { AuthChecker } from "type-graphql";

import env from "dotenv";
import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";
import { CtxUser } from "./types";
import { Access } from "../entitites/User";

env.config();

export interface Context {
  req: Request;
  res: Response;
  user: CtxUser | null;
  locale: string;
  requestId: string;
}

// check whether hostname is set on incoming request
export function createContext({
  req,
  res,
}: ExpressContextFunctionArgument): Context {
  const appContext: Context = {
    req: req as Request,
    res: res as Response,
    locale: req.cookies.NEXT_locale,
    user: null,
    requestId: randomUUID(),
  };

  if (req.cookies.accessToken) {
    const token = req.cookies.accessToken.split("Bearer ")[1];
    if (token) {
      const decoded = verifyJwt<CtxUser & { sessionVersion?: number }>(token);
      if (decoded?.sessionVersion === 2 && ObjectId.isValid(decoded.id)) {
        appContext.user = { ...decoded, id: new ObjectId(decoded.id) };
      }
    }
  }

  return appContext;
}

export function signJwt(object: Object, options?: SignOptions | undefined) {
  return sign(object, process.env.SECRET || "JWT_SECRET", {
    ...(options && options),
  });
}

export function verifyJwt<T>(token: string) {
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
  roles,
) => {
  //checks for user inside the context
  if (roles.length === 0) {
    return user !== null;
  }
  //roles exists but no user in the context
  if (!user) return false;

  //check if user role matches the defined role
  if (roles.some((role) => user.access.includes(role as Access))) return true;

  //no roles matched
  return false;
};

export function issueSessionToken(
  user: Pick<CtxUser, "id" | "name" | "email" | "access">,
  originalActorId?: string,
) {
  return (
    "Bearer " +
    signJwt(
      {
        sessionVersion: 2,
        id: user.id,
        name: user.name,
        email: user.email,
        access: user.access,
        ...(originalActorId ? { originalActorId } : {}),
      },
      { expiresIn: "24h" },
    )
  );
}
