import { Max, Min } from "class-validator";
import { ObjectId } from "mongodb";
import { ArgsType, ClassType, Field, Int, ObjectType } from "type-graphql";
import { Attendee } from "../../entities/Attendee";
import { RefDocExists } from "../../util/decorators";

//generic function for creating corresponding Connection Type enabling relay style pagination
export function CreateConnection<TNode>(TNodeClass: ClassType<TNode>) {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType(`${TNodeClass.name}Edge`)
  abstract class Edge {
    @Field(() => TNodeClass) // here we use the runtime argument
    node: TNode; // and here the generic type

    @Field()
    cursor: ObjectId;
  }

  @ObjectType(`${TNodeClass.name}PageInfo`)
  abstract class PageInfo {
    @Field()
    endCursor: ObjectId;

    @Field()
    hasNextPage: boolean;
  }

  @ObjectType({ isAbstract: true })
  abstract class Connection {
    @Field(() => [Edge], { nullable: "items" })
    edges: Edge[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;
  }

  return Connection;
}

export function CreateConnectionArgs<TNode>(TNodeClass: ClassType<TNode>) {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ArgsType()
  abstract class ConnectionArgs {
    @Field(() => ObjectId, { nullable: true })
    @RefDocExists(TNodeClass, {
      message: "Cursor's document not found!",
    })
    after?: ObjectId;

    @Field(() => Int, { defaultValue: 20, nullable: true })
    @Min(1)
    @Max(50)
    first?: number;
  }

  return ConnectionArgs;
}
