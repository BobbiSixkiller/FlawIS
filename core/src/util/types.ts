import { User } from "../entitites/User";

export type CtxUser = Pick<User, "id" | "email" | "name" | "access"> & {
  originalActorId?: string;
};

export type ResetToken = {
  id: string;
  purpose?: string;
} | null;
