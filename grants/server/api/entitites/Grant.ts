import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, ID, Int, ObjectType } from "type-graphql";
import CreateConnection from "../resolvers/types/pagination";
import { Ref } from "../util/types";
import { User } from "./User";

@ObjectType({ description: "Member model type" })
class Member extends TimeStamps {
  @Field(() => User)
  @Property({ ref: () => User })
  user: Ref<User>;

  @Field()
  @Property()
  hours: Number;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType({ description: "Budget model type" })
class Budget extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field()
  @Property()
  year: Date;

  @Field()
  @Property()
  travel: Number;

  @Field()
  @Property()
  material: Number;

  @Field()
  @Property()
  services: Number;

  @Field()
  @Property()
  indirect: Number;

  @Field()
  @Property()
  salaries: Number;

  @Field(() => [Member])
  @Property({ type: () => Member, _id: false })
  members: Member[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType({ description: "Attendee model type" })
export class Grant extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  start: Date;

  @Field()
  @Property()
  end: Date;

  @Field(() => [String])
  @Property({ type: () => [String] })
  files: string[];

  @Field(() => [Budget])
  @Property({ type: () => [Budget] })
  budget: Budget[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType({
  description: "GrantConnection type enabling cursor based pagination",
})
export class GrantConnection extends CreateConnection(Grant) {}
