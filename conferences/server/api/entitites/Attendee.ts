import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, ID, Int, ObjectType } from "type-graphql";
import CreateConnection from "../resolvers/types/pagination";

import { Ref } from "../util/types";

import { Billing, Conference, Host } from "./Conference";
import { Submission } from "./Submission";
import { User } from "./User";

@ObjectType({ description: "The body of an invoice" })
class InvoiceData {
  @Field()
  @Property({ default: "Faktúra" })
  type: String;

  @Field()
  @Property({ default: Date.now() })
  issueDate: Date;

  @Field()
  @Property({ default: Date.now() })
  vatDate: Date;

  @Field()
  @Property({ default: new Date().setDate(new Date().getDate() + 30) })
  dueDate: Date;

  @Field()
  @Property()
  variableSymbol: String;

  @Field(() => Int)
  @Property()
  ticketPrice: Number;

  @Field(() => Int)
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

  @Field(() => Host)
  @Property({ type: () => Host, _id: false })
  issuer: Host;

  @Field(() => InvoiceData)
  @Property({ type: () => InvoiceData, _id: false })
  body: InvoiceData;
}

@ObjectType({ description: "Attendee model type" })
export class Attendee extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field(() => Conference)
  @Property({ ref: () => Conference })
  conference: Ref<Conference>;

  @Field(() => User)
  @Property({ _id: false })
  user: User;

  @Field()
  @Property()
  withSubmission: boolean;

  @Field()
  @Property()
  online: boolean;

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

@ObjectType({
  description: "AttendeeConnection type enabling cursor based pagination",
})
export class AttendeeConnection extends CreateConnection(Attendee) {}
