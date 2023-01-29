"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = __importDefault(require("typedi"));
const apollo_server_1 = require("apollo-server");
const mongoose_1 = require("mongoose");
const mongodb_1 = require("mongodb");
const scalars_1 = require("./util/scalars");
const typegoose_middleware_1 = require("./middlewares/typegoose-middleware");
const user_1 = require("./resolvers/user");
const resolveUserReference_1 = require("./resolvers/resolveUserReference");
const buildFederatedSchema_1 = require("./util/buildFederatedSchema");
const auth_1 = require("./util/auth");
const rmq_1 = __importDefault(require("./util/rmq"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("./util/redis");
dotenv_1.default.config();
const port = process.env.PORT || 5001;
const mongooseUri = process.env.MONGODB_URI || "mongodb://localhost:27017/grants";
async function main() {
    //Build schema
    const schema = await (0, buildFederatedSchema_1.buildFederatedSchema)({
        resolvers: [user_1.UserResolver],
        // use document converting middleware
        globalMiddlewares: [typegoose_middleware_1.TypegooseMiddleware],
        // use ObjectId scalar mapping
        scalarsMap: [{ type: mongodb_1.ObjectId, scalar: scalars_1.ObjectIdScalar }],
        emitSchemaFile: true,
        container: typedi_1.default,
        //disabled validation for dev purposes
        //validate: false,
        authChecker: auth_1.authChecker,
    }, {
        User: { __resolveReference: resolveUserReference_1.resolveUserReference },
    });
    //Create Apollo server
    const server = new apollo_server_1.ApolloServer({
        schema,
        context: ({ req, res }) => ({
            req,
            res,
            user: req.headers.user ? JSON.parse(req.headers.user) : null,
            locale: req.headers.locale
                ? JSON.parse(req.headers.locale)
                : "sk",
        }),
    });
    // create mongoose connection
    const mongoose = await (0, mongoose_1.connect)(mongooseUri);
    console.log(mongoose.connection && "Database connected!");
    await rmq_1.default.init();
    rmq_1.default.consumeMessages(["user.update.billings"]);
    await (0, redis_1.initRedis)();
    await server.listen({ port }, () => console.log(`🚀 Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`));
}
main().catch(console.error);
