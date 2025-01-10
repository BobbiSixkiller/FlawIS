import { getClass } from "@typegoose/typegoose";
import { Model, Document } from "mongoose";
import { MiddlewareFn } from "type-graphql";
import { Types } from "mongoose";

export const TypegooseMiddleware: MiddlewareFn = async (_, next) => {
  const result = await next();

  if (Array.isArray(result)) {
    return result.map((item) =>
      item instanceof Model ? convertDocument(item) : item
    );
  }

  if (result instanceof Model) {
    return convertDocument(result);
  }

  return result;
};

export function transformIds(doc: object) {
  const transformed = Object.entries(doc).map(([key, value]) => {
    if (key === "_id") {
      key = "id";
    }

    if (Array.isArray(value)) {
      value = value.map((item) =>
        typeof item === "object" &&
        item !== null &&
        !(item instanceof Date) &&
        !(item instanceof Types.ObjectId)
          ? transformIds(item)
          : item
      );
    } else if (
      value &&
      typeof value === "object" &&
      !(value instanceof Date) &&
      !(value instanceof Types.ObjectId)
    ) {
      value = transformIds(value);
    }

    return [key, value];
  });

  return Object.fromEntries(transformed);
}

export function convertDocument(doc: Document) {
  const convertedDocument = transformIds(doc.toObject());
  const DocumentClass = getClass(doc)!;
  Object.setPrototypeOf(convertedDocument, DocumentClass.prototype);
  return convertedDocument;
}
