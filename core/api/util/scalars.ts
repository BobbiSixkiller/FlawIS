import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";

export const ObjectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "Mongo object id scalar type",
  serialize(value: unknown): string {
    if (!(value instanceof ObjectId)) {
      throw new Error("ObjectIdScalar can only serialize ObjectId values");
    }
    return value.toHexString(); // Value sent to client
  },
  parseValue(value: unknown): ObjectId {
    if (typeof value !== "string") {
      throw new Error("ObjectIdScalar can only parse string values");
    }
    return new ObjectId(value); // Value from client input variables
  },
  parseLiteral(ast): ObjectId {
    if (ast.kind !== Kind.STRING) {
      throw new Error("ObjectIdScalar can only parse string values");
    }
    return new ObjectId(ast.value); // Value from client query
  },
});
