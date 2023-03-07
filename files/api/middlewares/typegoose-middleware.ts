import { Model, Document, Types } from "mongoose";
import { MiddlewareFn } from "type-graphql";
import { getClassForDocument } from "typegoose";

export const TypegooseMiddleware: MiddlewareFn = async ({}, next) => {
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
  const transformed = [];

  for (let [key, value] of Object.entries(doc)) {
    if (key === "_id") key = "id";

    if (typeof value === "object" && value?.hasOwnProperty("_id")) {
      value = transformIds(value);
    }

    if (
      typeof value === "object" &&
      Array.isArray(value) &&
      !value.every((i) => typeof i === "string" || Types.ObjectId.isValid(i))
    ) {
      console.log(value);
      value = value.map((v) => transformIds(v));
    }

    transformed.push([key, value]);
  }

  return Object.fromEntries(transformed);
}

function convertDocument(doc: Document) {
  const convertedDocument = transformIds(doc.toObject());
  const DocumentClass = getClassForDocument(doc)!;
  Object.setPrototypeOf(convertedDocument, DocumentClass.prototype);
  return convertedDocument;
}
