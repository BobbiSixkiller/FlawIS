"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFederatedSchema = void 0;
const graphql_1 = require("graphql");
const directives_1 = __importDefault(require("@apollo/federation/dist/directives"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const federation_1 = require("@apollo/federation");
const apollo_graphql_1 = require("apollo-graphql");
const type_graphql_1 = require("type-graphql");
async function buildFederatedSchema(options, referenceResolvers) {
    const schema = await (0, type_graphql_1.buildSchema)({
        ...options,
        directives: [
            ...graphql_1.specifiedDirectives,
            ...directives_1.default,
            ...(options.directives || []),
        ],
        skipCheck: true,
    });
    const federatedSchema = (0, federation_1.buildFederatedSchema)({
        typeDefs: (0, graphql_tag_1.default)((0, federation_1.printSchema)(schema)),
        resolvers: (0, type_graphql_1.createResolversMap)(schema),
    });
    if (referenceResolvers) {
        (0, apollo_graphql_1.addResolversToSchema)(federatedSchema, referenceResolvers);
    }
    return federatedSchema;
}
exports.buildFederatedSchema = buildFederatedSchema;
