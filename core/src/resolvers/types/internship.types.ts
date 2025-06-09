import { ArgsType, Field, InputType, Int, ObjectType } from "type-graphql";
import { CreateArgs, CreateConnection } from "./pagination.types";
import { Intern, Internship, Status } from "../../entitites/Internship";
import { IMutationResponse } from "./interface.types";
import { ObjectId } from "mongodb";

@ObjectType()
class AcademicYear {
  @Field()
  academicYear: string;

  @Field(() => Int)
  count: number;
}

@ObjectType({
  description: "InternshipConnection type enabling cursor based pagination",
})
export class InternshipConnection extends CreateConnection(Internship) {
  @Field(() => [AcademicYear])
  academicYears: AcademicYear[];
}

@ArgsType()
export class InternshipArgs extends CreateArgs(Internship) {
  @Field(() => ObjectId, { nullable: true })
  user?: ObjectId;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  academicYear?: string;

  @Field(() => ObjectId, { nullable: true })
  contextUserId?: ObjectId;
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

  @Field(() => [Status], { nullable: true })
  status?: Status[];
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
