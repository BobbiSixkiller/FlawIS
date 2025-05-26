import { ObjectId } from "mongodb";
import { Conference, Ticket } from "../entitites/Conference";
import { DocumentType } from "@typegoose/typegoose";

export type User = {
  id: ObjectId;
  name: string;
  email: string;
  access: string[];
};

export type ResetToken = {
  id: string;
} | null;

export type VerifiedTicket = {
  ticket: Ticket;
  conference: DocumentType<Conference>;
};
