import { ObjectId } from "mongodb";
import { Field, InputType } from "type-graphql";

@InputType({ description: "file input type" })
export class FileInput {
  @Field()
  id: ObjectId;

  @Field()
  path: string;
}
