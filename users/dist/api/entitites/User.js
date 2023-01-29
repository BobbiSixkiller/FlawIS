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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Role = void 0;
const type_graphql_1 = require("type-graphql");
const mongodb_1 = require("mongodb");
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const bcrypt_1 = require("bcrypt");
const auth_1 = require("../util/auth");
var Role;
(function (Role) {
    Role["Basic"] = "BASIC";
    Role["Admin"] = "ADMIN";
})(Role = exports.Role || (exports.Role = {}));
(0, type_graphql_1.registerEnumType)(Role, {
    name: "Role",
    description: "User role inside the FLAWIS system", // this one is optional
});
let User = User_1 = class User extends defaultClasses_1.TimeStamps {
    get token() {
        return ("Bearer " +
            (0, auth_1.signJwt)({
                id: this.id,
                email: this.email,
                name: this.name,
                role: this.role,
            }, { expiresIn: "7d" }));
    }
    static async paginatedUsers(first, after) {
        return await this.aggregate([
            {
                $facet: {
                    data: [
                        { $sort: { _id: -1 } },
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                        { $eq: [after, null] },
                                        { $ne: ["$_id", null] },
                                        { $lt: ["$_id", after] },
                                    ],
                                },
                            },
                        },
                        { $limit: first || 20 },
                        {
                            $addFields: {
                                id: "$_id", //transform _id to id property as defined in GraphQL object types
                            },
                        },
                    ],
                    hasNextPage: [
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                        { $eq: [after, null] },
                                        { $ne: ["$_id", null] },
                                        { $lt: ["$_id", after] },
                                    ],
                                },
                            },
                        },
                        { $skip: first || 20 },
                        { $limit: 1 }, // just to check if there's any element
                    ],
                },
            },
            {
                $unwind: { path: "$hasNextPage", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    edges: {
                        $map: {
                            input: "$data",
                            as: "edge",
                            in: { cursor: "$$edge._id", node: "$$edge" },
                        },
                    },
                    pageInfo: {
                        hasNextPage: { $eq: [{ $size: "$hasNextPage" }, 1] },
                        endCursor: { $last: "$data.id" },
                    },
                },
            },
        ]);
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    __metadata("design:type", mongodb_1.ObjectId)
], User.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typegoose_1.prop)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Role),
    (0, typegoose_1.prop)({ default: "BASIC", enum: ["BASIC", "ADMIN"] }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "verified", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = User_1 = __decorate([
    (0, typegoose_1.pre)("save", async function () {
        if (this.isNew || this.isModified("password")) {
            this.password = await (0, bcrypt_1.hash)(this.password, 12);
        }
        if (this.isNew || this.isModified("email")) {
            const emailExists = await (0, typegoose_1.getModelForClass)(User_1)
                .findOne({ email: this.email })
                .exec();
            if (emailExists && emailExists.id !== this.id) {
                throw new type_graphql_1.ArgumentValidationError([
                    {
                        target: User_1,
                        property: "email",
                        value: this.email,
                        constraints: {
                            // Constraints that failed validation with error messages.
                            EmailExists: "Submitted email address is already in use!",
                        },
                        //children?: ValidationError[], // Contains all nested validation errors of the property
                    },
                ]);
            }
        }
    }),
    (0, typegoose_1.Index)({ name: "text" }),
    (0, type_graphql_1.Directive)('@key(fields: "id")'),
    (0, type_graphql_1.ObjectType)({ description: "The user model entity" })
], User);
exports.User = User;
