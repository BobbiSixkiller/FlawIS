import { Request, Response } from "express";

import env from "dotenv";
import { AuthChecker } from "type-graphql";

env.config();

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Context {
  req: Request;
  res: Response;
  user: User | null;
}

export const authChecker: AuthChecker<Context> = (
  { context: { user } },
  roles
) => {
  //checks for user inside the context
  if (roles.length === 0) {
    return user !== null;
  }
  //roles exists but no user in the context
  if (!user) return false;

  if (roles.includes(user.role)) {
    return true;
  }

  //no roles matched
  return false;
};
