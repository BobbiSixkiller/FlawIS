"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUserReference = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const User_1 = require("../entitites/User");
async function resolveUserReference(reference) {
    return await (0, typegoose_1.getModelForClass)(User_1.User).findOne({ _id: reference.id });
}
exports.resolveUserReference = resolveUserReference;
