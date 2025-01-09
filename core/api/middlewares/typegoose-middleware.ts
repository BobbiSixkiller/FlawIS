import { Model, Document, Types } from "mongoose";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../util/auth";
import { getClass } from "@typegoose/typegoose";

export const TypegooseMiddleware: MiddlewareFn<Context> = async ({}, next) => {
  const result = await next();

  if (Array.isArray(result)) {
    return result.map((item) => processItem(item));
  }

  if (result) {
    return processItem(result);
  }

  return result;
};

function processItem(item: any) {
  if (item instanceof Model) {
    return convertDocument(item);
  } else if (isPlainObject(item)) {
    return transformIds(item);
  }
  return item;
}

function isPlainObject(value: any): value is object {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !Types.ObjectId.isValid(value) &&
    !(value instanceof Date)
  );
}

export function convertDocument(doc: Document) {
  const convertedDocument = transformIds(doc.toObject());
  const DocumentClass = getClass(doc);
  Object.setPrototypeOf(convertedDocument, DocumentClass!.prototype);
  return convertedDocument;
}

export function transformIds(doc: object): object {
  const transformed = [];

  for (let [key, value] of Object.entries(doc)) {
    // Rename `_id` to `id`, while preserving `ObjectId` instances
    if (key === "_id") {
      key = "id";
    }

    if (value instanceof Types.ObjectId) {
      // Preserve ObjectId
    } else if (value instanceof Date) {
      // Ensure Dates are not altered
    } else if (isPlainObject(value)) {
      value = transformIds(value);
    } else if (Array.isArray(value)) {
      value = value.map((v) => (isPlainObject(v) ? transformIds(v) : v));
    }

    transformed.push([key, value]);
  }

  return Object.fromEntries(transformed);
}
