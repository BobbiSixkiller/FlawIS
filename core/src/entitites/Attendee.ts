import {
  getModelForClass,
  Index,
  Pre,
  prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { createUnionType, Field, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Conference, Ticket } from "./Conference";
import { Invoice } from "./Invoice";
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

@Pre<Attendee>("save", async function () {
  if (this.isNew) {
    await getModelForClass(Conference).updateOne(
      { slug: this.conference.slug },
      { $inc: { attendeesCount: 1 } },
      { session: this.$session() ?? undefined },
    );
  }
})
@Pre<Attendee>(
  "deleteOne",
  async function () {
    // Get the filter used in the query
    const queryFilter = this.getFilter();

    // Retrieve the document manually using a properly typed model
    const doc = await getModelForClass(Attendee).findOne(queryFilter);

    // Proceed with the update if the document exists
    if (doc) {
      await Promise.all([
        getModelForClass(Conference).updateOne(
          { _id: doc.conference.id },
          { $inc: { attendeesCount: -1 } }
        ),
        getModelForClass(Submission).updateMany(
          { authors: doc.user.id },
          { $pull: { authors: doc.user.id } }
        ),
      ]);
    }
  },
  { query: true, document: false }
)
@ObjectType({ description: "Attendee model type" })
@Index({ "user.name": "text", "user.email": "text" })
@Index({ "conference.slug": 1, _id: -1 }) //attendees query
@Index({ "user._id": 1, "conference.slug": 1 }) //attendee query
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
  @Property({ type: () => Invoice, _id: false })
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
