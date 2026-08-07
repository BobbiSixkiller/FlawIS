import { User } from "../entitites/User";

export type CtxUser = Pick<User, "id" | "email" | "name" | "access">;

export type ResetToken = {
  id: string;
} | null;
