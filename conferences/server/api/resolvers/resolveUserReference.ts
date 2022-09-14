import { getModelForClass } from "@typegoose/typegoose";
import { User } from "../entitites/User";

export async function resolveUserReference(
  reference: Pick<User, "id">
): Promise<User | []> {
  console.log(reference);
  const user = await getModelForClass(User).findOne({ _id: reference.id });
  console.log(user);
  return user ? user : [];
}
