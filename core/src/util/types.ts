import { Conference, Ticket } from "../entitites/Conference";
import { DocumentType } from "@typegoose/typegoose";
import { User } from "../entitites/User";

export type CtxUser = Pick<User, "id" | "email" | "name" | "access">;

export type ResetToken = {
  id: string;
} | null;

export type VerifiedTicket = {
  ticket: Ticket;
  conference: DocumentType<Conference>;
};
