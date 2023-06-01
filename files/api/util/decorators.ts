import { getModelForClass } from "@typegoose/typegoose";
import { ClassType, createParamDecorator } from "type-graphql";

export function LoadResource<TResource>(TResourceClass: ClassType<TResource>) {
  return createParamDecorator(async ({ args }) => {
    const resource = await getModelForClass(TResourceClass).findOne({
      _id: args.id,
    });
    if (!resource) {
      throw new Error("Resource not found!");
    }

    return resource;
  });
}
