import { Index, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { createUnionType, Field, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Conference, Ticket } from "./Conference";
import { Invoice, LegacyInvoiceSnapshot } from "./Invoice";
import { Submission } from "./Submission";
import { User, UserStub } from "./User";

export const UserStubUnion = createUnionType({
  name: "UserStubUnion", // Name of the GraphQL union
  types: () => [User, UserStub] as const, // function that returns tuple of object types classes
  // Implementation of detecting returned object type
  resolveType: (value) => {
    if ("createdAt" in value) {
      return User; // Return object type class (the one with `@ObjectType()`)
    } else {
      return UserStub;
    }
  },
});

@ObjectType()
export class AttendeeConference {
  @Field()
  id: ObjectId;

  @Field()
  @Property()
  slug: string;
}

@ObjectType({ description: "Attendee model type" })
@Index({ "user.name": "text", "user.email": "text" })
@Index({ "conference.slug": 1, _id: -1 }) //attendees query
@Index({ "user._id": 1, "conference.slug": 1 }) //attendee query
@Index({ "conference._id": 1, "user._id": 1 }, { unique: true })
@Index({ "invoice.issuer.variableSymbol": 1 }, { sparse: true })
export class Attendee extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => Conference)
  @Property({ type: () => AttendeeConference })
  conference: AttendeeConference;

  @Field(() => UserStubUnion)
  @Property({ type: () => UserStub })
  user: UserStub;

  @Field(() => Ticket)
  @Property({ type: () => Ticket })
  ticket: Ticket;

  // Legacy invoices remain readable while new records reference Invoice.
  @Field(() => Invoice)
  @Property({ type: () => LegacyInvoiceSnapshot, _id: false })
  invoice?: Invoice;

  @Property()
  invoiceId?: ObjectId;

  @Field(() => [Submission])
  submissions: Submission[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
