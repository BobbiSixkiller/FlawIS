import { Index, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, Float, ObjectType } from "type-graphql";

import { Billing } from "./Billing";

@ObjectType({ description: "The body of an invoice" })
export class InvoiceData {
  @Field()
  @Property({ default: "Faktúra" })
  type: string;

  @Field()
  @Property({ default: () => new Date() })
  issueDate: Date;

  @Field()
  @Property({ default: () => new Date() })
  vatDate: Date;

  @Field()
  @Property({
    default: () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);
      return dueDate;
    },
  })
  dueDate: Date;

  @Field(() => Float)
  @Property()
  price: number;

  @Field(() => Float)
  @Property()
  vat: number;

  @Field()
  @Property()
  body: string;

  @Field()
  @Property()
  comment: string;
}

// Persistence-only shape for historical invoice subdocuments. Keeping it
// separate prevents canonical Invoice indexes from leaking into owner schemas.
export class LegacyInvoiceSnapshot {
  @Property({ required: true, type: () => Billing, _id: false })
  payer: Billing;

  @Property({ required: true, type: () => Billing, _id: false })
  issuer: Billing;

  @Property({ required: true, type: () => InvoiceData, _id: false })
  body: InvoiceData;
}

@ObjectType({ description: "Invoice entity" })
@Index({ "issuer.variableSymbol": 1 }, { unique: true })
@Index({ ownerType: 1, attendeeId: 1 }, { unique: true })
@Index({ ownerType: 1, userId: 1 })
export class Invoice extends TimeStamps {
  @Property({ enum: ["CONFERENCE_ATTENDEE", "COURSE_ATTENDEE"] })
  ownerType?: string;

  @Property()
  attendeeId?: ObjectId;

  @Property()
  userId?: ObjectId;

  @Field(() => Billing)
  @Property({ required: true, type: () => Billing, _id: false })
  payer: Billing;

  @Field(() => Billing)
  @Property({ required: true, type: () => Billing, _id: false })
  issuer: Billing;

  @Field(() => InvoiceData)
  @Property({ required: true, type: () => InvoiceData, _id: false })
  body: InvoiceData;
}

@Index({ prefix: 1 }, { unique: true })
export class InvoiceCounter {
  @Property({ required: true })
  prefix: string;

  @Property({ required: true, min: 0 })
  sequence: number;
}
