import { getModelForClass } from "@typegoose/typegoose";
import { User } from "../entitites/User";

export async function resolveUserReference(reference: User): Promise<User> {
  const user = await getModelForClass(User).findOne({ _id: reference.id });
  return user ? user : { ...reference, billings: [] };
}
