import { Index, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
@Index({ url: 1 }, { unique: true })
export class StoredObject extends TimeStamps {
  @Property({ required: true }) url: string;
  @Property({ required: true }) owner: ObjectId;
}
