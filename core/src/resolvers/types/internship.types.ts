import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";
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

@ObjectType()
class OrganizationCount {
  @Field()
  organization: string;

  @Field(() => Int)
  count: number;
}

@ObjectType({
  description: "InternshipConnection type enabling cursor based pagination",
})
export class InternshipConnection extends CreateConnection(Internship) {
  @Field(() => [AcademicYear])
  academicYears: AcademicYear[];

  @Field(() => [OrganizationCount])
  organizations: OrganizationCount[];
}

export enum InternshipSortableField {
  HAS_APPLICATION = "hasApplication",
  CREARTED_AT = "created_at",
  ORGANIZATION = "organization",
}

registerEnumType(InternshipSortableField, {
  name: "InternshipSortableField",
  description: "Sortable enum definition for interships query",
});

@InputType()
export class InternshipFilterInput {
  @Field(() => ObjectId, { nullable: true })
  user?: ObjectId;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  academicYear?: string;

  @Field(() => [String], { nullable: true })
  organizations?: string[];
}

@ArgsType()
export class InternshipArgs extends CreateArgs(
  Internship,
  InternshipSortableField
) {
  @Field(() => InternshipFilterInput, { nullable: true })
  filter?: InternshipFilterInput;
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

@InputType()
export class InternFilterInput {
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

export enum InternSortableField {
  NAME = "user.name",
  ID = "_id",
}

registerEnumType(InternSortableField, {
  name: "InternSortableField",
  description: "Sortable enum definition for interns query",
});

@ArgsType()
export class InternArgs extends CreateArgs(Intern, InternSortableField) {
  @Field(() => InternFilterInput, { nullable: true })
  filter?: InternFilterInput;
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
