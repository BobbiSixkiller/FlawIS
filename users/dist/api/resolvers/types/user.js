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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInput = exports.RegisterInput = exports.PasswordInput = exports.UserArgs = exports.UserConnection = void 0;
const type_graphql_1 = require("type-graphql");
const class_validator_1 = require("class-validator");
const mongodb_1 = require("mongodb");
const User_1 = require("../../entitites/User");
const validation_1 = require("../../util/validation");
const pagination_1 = __importDefault(require("./pagination"));
let UserConnection = class UserConnection extends (0, pagination_1.default)(User_1.User) {
};
UserConnection = __decorate([
    (0, type_graphql_1.ObjectType)({
        description: "UserConnection type enabling cursor based pagination",
    })
], UserConnection);
exports.UserConnection = UserConnection;
let UserArgs = class UserArgs {
    constructor() {
        this.first = 20;
        this.last = 20;
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, validation_1.RefDocExists)(User_1.User, {
        message: "Cursor's document not found!",
    }),
    __metadata("design:type", mongodb_1.ObjectId)
], UserArgs.prototype, "after", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 20 }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], UserArgs.prototype, "first", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, validation_1.RefDocExists)(User_1.User, {
        message: "Cursor's document not found!",
    }),
    __metadata("design:type", mongodb_1.ObjectId)
], UserArgs.prototype, "before", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 20, nullable: true }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], UserArgs.prototype, "last", void 0);
UserArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserArgs);
exports.UserArgs = UserArgs;
let PasswordInput = class PasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9!@#$&()\\-`.+,/\"]{8,}$/, {
        message: "Minimum 8 characters, at least 1 letter and 1 number!",
    }),
    __metadata("design:type", String)
], PasswordInput.prototype, "password", void 0);
PasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], PasswordInput);
exports.PasswordInput = PasswordInput;
let RegisterInput = class RegisterInput extends PasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(1, 100, { message: "Name can must be 1-100 characters long!" }),
    __metadata("design:type", String)
], RegisterInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterInput.prototype, "email", void 0);
RegisterInput = __decorate([
    (0, type_graphql_1.InputType)({ description: "New user input data" })
], RegisterInput);
exports.RegisterInput = RegisterInput;
let UserInput = class UserInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(1, 100, { message: "Name must be 1-100 characters long!" }),
    __metadata("design:type", String)
], UserInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Authorized)(["ADMIN"]),
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserInput.prototype, "role", void 0);
UserInput = __decorate([
    (0, type_graphql_1.InputType)({ description: "User update input data" })
], UserInput);
exports.UserInput = UserInput;
