"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectIdScalar = void 0;
const graphql_1 = require("graphql");
const mongodb_1 = require("mongodb");
exports.ObjectIdScalar = new graphql_1.GraphQLScalarType({
    name: "ObjectId",
    description: "Mongo object id scalar type",
    serialize(value) {
        // check the type of received value
        if (value instanceof mongodb_1.ObjectId)
            return value.toHexString();
        if (typeof value === "string")
            return value;
        throw new Error("ObjectIdScalar can only serialize ObjectId values");
    },
    parseValue(value) {
        // check the type of received value
        if (typeof value !== "string") {
            throw new Error("ObjectIdScalar can only parse string values");
        }
        return new mongodb_1.ObjectId(value); // value from the client input variables
    },
    parseLiteral(ast) {
        // check the type of received value
        if (ast.kind !== graphql_1.Kind.STRING) {
            throw new Error("ObjectIdScalar can only parse string values");
        }
        return new mongodb_1.ObjectId(ast.value); // value from the client query
    },
});
