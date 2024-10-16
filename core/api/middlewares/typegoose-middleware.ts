import { Model, Document, Types } from "mongoose";
import { getClass } from "@typegoose/typegoose";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../util/auth";

export const TypegooseMiddleware: MiddlewareFn<Context> = async ({}, next) => {
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
    if (key === "_id") {
      key = "id";
    }

    if (key.includes("Url") && process.env.NODE_ENV === "staging") {
      value = value.replace("minio", "minio-staging");
    }

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length > 1
    ) {
      value = transformIds(value);
    }

    if (
      value &&
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
