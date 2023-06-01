import { getModelForClass } from "@typegoose/typegoose";
import { Model } from "mongoose";
import { File } from "../entities/File";
import { convertDocument } from "../middlewares/typegoose-middleware";

export async function resolveFileReference(
  reference: Pick<File, "id">
): Promise<File | undefined | null> {
  const res = await getModelForClass(File).findOne({ _id: reference.id });
  if (res && res instanceof Model) {
    return convertDocument(res);
  }

  return res;
}
