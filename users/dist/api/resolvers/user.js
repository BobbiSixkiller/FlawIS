"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const mongodb_1 = require("mongodb");
const typedi_1 = require("typedi");
const User_1 = require("../entitites/User");
const CRUDservice_1 = require("../services/CRUDservice");
const type_graphql_2 = require("type-graphql");
const user_1 = require("./types/user");
const apollo_server_core_1 = require("apollo-server-core");
const auth_1 = require("../util/auth");
const bcrypt_1 = require("bcrypt");
const type_graphql_3 = require("type-graphql");
const rmq_1 = __importDefault(require("../util/rmq"));
const ratelimit_middleware_1 = require("../middlewares/ratelimit-middleware");
let UserResolver = class UserResolver {
    //using mongodb change steams to handle user integrity accross federated subgraphs
    constructor(userService = new CRUDservice_1.CRUDservice(User_1.User)) {
        this.userService = userService;
        userService.dataModel
            .watch([])
            .on("change", (data) => {
            var _a, _b, _c, _d, _e, _f, _g;
            switch (data.operationType) {
                case "insert":
                    return rmq_1.default.produceMessage(JSON.stringify({
                        id: (_a = data.documentKey) === null || _a === void 0 ? void 0 : _a._id,
                        email: (_b = data.fullDocument) === null || _b === void 0 ? void 0 : _b.email,
                        name: (_c = data.fullDocument) === null || _c === void 0 ? void 0 : _c.name,
                    }), "user.new");
                case "update":
                    return rmq_1.default.produceMessage(JSON.stringify({
                        id: (_d = data.documentKey) === null || _d === void 0 ? void 0 : _d._id,
                        email: (_f = (_e = data.updateDescription) === null || _e === void 0 ? void 0 : _e.updatedFields) === null || _f === void 0 ? void 0 : _f.email,
                    }), "user.update.email");
                case "delete":
                    console.log(data.documentKey, data.operationType);
                    return rmq_1.default.produceMessage(JSON.stringify({
                        id: (_g = data.documentKey) === null || _g === void 0 ? void 0 : _g._id,
                    }), "user.delete");
                default:
                    console.log("Unhandled operation type: ", data.operationType);
                    return;
            }
        });
    }
    async users({ first, after }) {
        const users = await this.userService.dataModel.paginatedUsers(first, after);
        return users[0];
    }
    async user(id) {
        const user = await this.userService.findOne({ _id: id });
        if (!user)
            throw new Error("User not found!");
        return user;
    }
    async userTextSearch(text, domain) {
        return await this.userService.aggregate([
            { $match: { $text: { $search: text } } },
            { $sort: { score: { $meta: "textScore" } } },
            {
                $match: {
                    $expr: {
                        $cond: [
                            { $ne: [domain, null] },
                            {
                                $eq: [
                                    { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] },
                                    domain,
                                ],
                            },
                            { $ne: ["$_id", null] },
                        ],
                    },
                },
            },
            { $addFields: { id: "$_id" } },
        ]);
    }
    async me({ user, locale }) {
        const loggedInUser = await this.userService.findOne({ _id: user === null || user === void 0 ? void 0 : user.id });
        if (!loggedInUser)
            throw new apollo_server_core_1.AuthenticationError("User account has been deleted!");
        return loggedInUser;
    }
    async register(registerInput, { res, locale } //produceMessage for email service and define coresponding routing keys
    ) {
        console.log(locale);
        const user = await this.userService.create(registerInput);
        res.cookie("accessToken", user.token, {
            httpOnly: true,
            expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        rmq_1.default.produceMessage(JSON.stringify({
            locale,
            name: user.name,
            email: user.email,
            token: (0, auth_1.signJwt)({ id: user.id }, { expiresIn: "1d" }),
        }), "mail.registration");
        return user;
    }
    resendActivationLink({ locale, user }) {
        rmq_1.default.produceMessage(JSON.stringify({
            locale,
            name: user === null || user === void 0 ? void 0 : user.name,
            email: user === null || user === void 0 ? void 0 : user.email,
            token: (0, auth_1.signJwt)({ id: user === null || user === void 0 ? void 0 : user.id }, { expiresIn: "1d" }),
        }), "mail.registration");
        return true;
    }
    async activateUser(token) {
        const user = (0, auth_1.verifyJwt)(token);
        if (user) {
            const { modifiedCount } = await this.userService.update({ _id: user.id, verified: false }, { verified: true });
            return modifiedCount > 0;
        }
        return false;
    }
    async login(email, password, { res }) {
        const user = await this.userService.findOne({ email });
        if (!user)
            throw new apollo_server_core_1.AuthenticationError("Invalid credentials!");
        const match = await (0, bcrypt_1.compare)(password, user.password);
        if (!match)
            throw new apollo_server_core_1.AuthenticationError("Invalid credentials!");
        res.cookie("accessToken", user.token, {
            httpOnly: true,
            expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        return user;
    }
    logout({ res }) {
        res.clearCookie("accessToken");
        return true;
    }
    async forgotPassword(email, { locale }) {
        const user = await this.userService.findOne({ email });
        if (!user)
            throw new apollo_server_core_1.UserInputError("No user with provided email address found!");
        const token = (0, auth_1.signJwt)({ id: user.id }, { expiresIn: "1h" });
        rmq_1.default.produceMessage(JSON.stringify({ locale, email: user.email, name: user.name, token }), "mail.reset");
        return "Password reset link has been sent to your email!";
    }
    async passwordReset({ password }, { req }) {
        const token = req.headers.resettoken;
        const userId = (0, auth_1.verifyJwt)(token);
        if (!userId)
            throw new Error("Reset token expired!");
        const user = await this.userService.findOne({ _id: userId.id });
        if (!user)
            throw new Error("User not found!");
        user.password = password;
        return await user.save();
    }
    async updateUser(id, userInput) {
        const user = await this.userService.findOne({ _id: id });
        if (!user)
            throw new apollo_server_core_1.UserInputError("User not found!");
        for (const [key, value] of Object.entries(userInput)) {
            user[key] = value;
        }
        return await user.save();
    }
    async deleteUser(id) {
        const { deletedCount } = await this.userService.delete({ _id: id });
        return deletedCount > 0;
    }
};
__decorate([
    (0, type_graphql_3.Authorized)(["ADMIN"]),
    (0, type_graphql_1.Query)(() => user_1.UserConnection),
    __param(0, (0, type_graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_1.UserArgs]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_3.Authorized)(["ADMIN"]),
    (0, type_graphql_1.Query)(() => User_1.User),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mongodb_1.ObjectId]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_3.Authorized)(),
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __param(0, (0, type_graphql_1.Arg)("text")),
    __param(1, (0, type_graphql_1.Arg)("domain", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "userTextSearch", null);
__decorate([
    (0, type_graphql_3.Authorized)(),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(100)]),
    (0, type_graphql_1.Query)(() => User_1.User),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_2.Mutation)(() => User_1.User),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(50)]),
    __param(0, (0, type_graphql_1.Arg)("data")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_1.RegisterInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_3.Authorized)(),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(10)]),
    (0, type_graphql_2.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "resendActivationLink", null);
__decorate([
    (0, type_graphql_2.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(10)]),
    __param(0, (0, type_graphql_1.Arg)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "activateUser", null);
__decorate([
    (0, type_graphql_2.Mutation)(() => User_1.User),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(50)]),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_3.Authorized)(),
    (0, type_graphql_2.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Query)(() => String),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(50)]),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_2.Mutation)(() => User_1.User),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(10)]),
    __param(0, (0, type_graphql_1.Arg)("data")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_1.PasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "passwordReset", null);
__decorate([
    (0, type_graphql_3.Authorized)(["ADMIN", "IS_OWN_USER"]),
    (0, type_graphql_1.UseMiddleware)([(0, ratelimit_middleware_1.RateLimit)(10)]),
    (0, type_graphql_2.Mutation)(() => User_1.User),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("data")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mongodb_1.ObjectId, user_1.UserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_3.Authorized)(["ADMIN"]),
    (0, type_graphql_2.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mongodb_1.ObjectId]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
UserResolver = __decorate([
    (0, typedi_1.Service)(),
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [Object])
], UserResolver);
exports.UserResolver = UserResolver;
