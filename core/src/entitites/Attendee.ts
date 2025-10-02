import {
  getModelForClass,
  Index,
  Pre,
  prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { createUnionType, Field, Float, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Billing, FlawBilling } from "./Billing";
import { Conference, Ticket } from "./Conference";
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

@ObjectType({ description: "The body of an invoice" })
export class InvoiceData {
  @Field()
  @Property({ default: "Faktúra" })
  type?: String;

  @Field()
  @Property({ default: Date.now() })
  issueDate?: Date;

  @Field()
  @Property({ default: Date.now() })
  vatDate?: Date;

  @Field()
  @Property({ default: new Date().setDate(new Date().getDate() + 15) })
  dueDate?: Date;

  @Field(() => Float)
  @Property()
  price: Number;

  @Field(() => Float)
  @Property()
  vat: Number;

  @Field()
  @Property()
  body: String;

  @Field()
  @Property()
  comment: String;
}

@ObjectType({ description: "Invoice entity subdocument type" })
export class Invoice {
  @Field(() => Billing)
  @Property({ type: () => Billing, _id: false })
  payer: Billing;

  @Field(() => FlawBilling)
  @Property({ type: () => FlawBilling, _id: false })
  issuer: FlawBilling;

  @Field(() => InvoiceData)
  @Property({ type: () => InvoiceData, _id: false })
  body: InvoiceData;
}

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
      { $inc: { attendeesCount: 1 } }
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

  //invoice subdoc added so individual invoice customization is possible
  @Field(() => Invoice)
  @Property({ type: () => Invoice, _id: false })
  invoice: Invoice;

  @Field(() => [Submission])
  submissions: Submission[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
