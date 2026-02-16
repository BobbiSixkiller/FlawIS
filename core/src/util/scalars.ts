import {
  GraphQLError,
  GraphQLScalarType,
  Kind,
  print,
  ValueNode,
} from "graphql";
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

function ensureObject(value: any, ast?: ValueNode): object {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new GraphQLError(
      `JSONObject cannot represent non-object value: ${value}`,
      ast
        ? {
            nodes: ast,
          }
        : undefined,
    );
  }

  return value;
}

function parseObject(ast: ValueNode, variables: any): any {
  if (ast.kind !== Kind.OBJECT) {
    throw new GraphQLError(
      `JSONObject cannot represent non-object value: ${print(ast)}`,
      ast
        ? {
            nodes: ast,
          }
        : undefined,
    );
  }

  const value = Object.create(null);
  ast.fields.forEach((field) => {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(field.value, variables);
  });

  return value;
}

function parseLiteral(ast: ValueNode, variables: any): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast, variables);
    case Kind.LIST:
      return ast.values.map((n) => parseLiteral(n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE: {
      const name = ast.name.value;
      return variables ? variables[name] : undefined;
    }
  }
}

export const JSONObject = new GraphQLScalarType({
  name: "JSONObject",
  description:
    "The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).",
  serialize: ensureObject,
  parseValue: ensureObject,
  parseLiteral: parseObject,
});
