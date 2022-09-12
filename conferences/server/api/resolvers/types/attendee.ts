import { Field, ArgsType, Int, InputType } from "type-graphql";
import { Min, Max } from "class-validator";
import { ObjectId } from "mongodb";

import { Attendee } from "../../entitites/Attendee";
import { RefDocExists } from "../../util/decorators";
import { BillingInput } from "./conference";

@InputType()
export class AttendeeInput {
	@Field()
	conferenceId: ObjectId;

	@Field()
	ticketId: ObjectId;

	@Field()
	billing: BillingInput;
}

@InputType()
class InvoiceDataInput {
	@Field()
	type: String;

	@Field()
	issueDate: Date;

	@Field()
	vatDate: Date;

	@Field()
	dueDate: Date;

	@Field()
	variableSymbol: String;

	@Field(() => Int)
	ticketPrice: Number;

	@Field(() => Int)
	vat: Number;

	@Field()
	body: String;

	@Field()
	comment: String;
}

@InputType({
	description: "Invoice data input type facilitating attendee's invoice update",
})
export class InvoiceInput {
	@Field(() => BillingInput, { nullable: true })
	issuer: BillingInput;

	@Field(() => BillingInput, { nullable: true })
	payer: BillingInput;

	@Field(() => InvoiceDataInput, { nullable: true })
	body: InvoiceDataInput;
}

@ArgsType()
export class AttendeeArgs {
	@Field(() => String, { nullable: true })
	@RefDocExists(Attendee, {
		message: "Cursor's document not found!",
	})
	after?: ObjectId;

	@Field(() => Int, { defaultValue: 20, nullable: true })
	@Min(1)
	@Max(50)
	first?: number;

	@Field(() => String, { nullable: true })
	@RefDocExists(Attendee, {
		message: "Cursor's document not found!",
	})
	before?: ObjectId;

	@Field(() => Int, { defaultValue: 20, nullable: true })
	@Min(1)
	@Max(50)
	last?: number;
}
