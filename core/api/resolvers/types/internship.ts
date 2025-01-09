import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import { CreateArgs, CreateConnection } from "./pagination";
import { Intern, Internship, Status } from "../../entitites/Internship";
import { IMutationResponse } from "./interface";
import { ObjectId } from "mongodb";

@ObjectType({
  description: "InternshipConnection type enabling cursor based pagination",
})
export class InternshipConnection extends CreateConnection(Internship) {}

@ArgsType()
export class InternshipArgs extends CreateArgs(Internship) {
  @Field(() => ObjectId, { nullable: true })
  user?: ObjectId;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@ObjectType({ implements: IMutationResponse })
export class InternshipMutationResponse extends IMutationResponse {
  @Field(() => Internship)
  data: Internship;
}

@ObjectType({
  description: "InternConnection type enabling cursor based pagination",
})
export class InternConnection extends CreateConnection(Intern) {}

@ArgsType()
export class InternArgs extends CreateArgs(Intern) {
  @Field(() => ObjectId, { nullable: true })
  internship?: ObjectId;

  @Field(() => ObjectId, { nullable: true })
  user?: ObjectId;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  status?: Status;
}

@ObjectType({ implements: IMutationResponse })
export class InternMutationResponse extends IMutationResponse {
  @Field(() => Intern)
  data: Intern;
}

@InputType()
export class InternshipInput implements Partial<Internship> {
  @Field()
  description: string;
}
