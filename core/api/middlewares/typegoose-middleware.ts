import { Model, Document, Types } from "mongoose";
import { getClass } from "@typegoose/typegoose";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../util/auth";

export const TypegooseMiddleware: MiddlewareFn<Context> = async ({}, next) => {
  const result = await next();

  if (Array.isArray(result)) {
    return result.map((item) =>
      item instanceof Model ? convertDocument(item) : transformIds(item)
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
      value = value.map((v) => transformIds(v));
    }

    transformed.push([key, value]);
  }

  return Object.fromEntries(transformed);
}

export function convertDocument(doc: Document) {
  const convertedDocument = transformIds(doc.toObject());
  const DocumentClass = getClass(doc);
  Object.setPrototypeOf(convertedDocument, DocumentClass!.prototype);
  return convertedDocument;
}
