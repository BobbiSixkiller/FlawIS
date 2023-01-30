"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefDocExists = void 0;
const class_validator_1 = require("class-validator");
const typegoose_1 = require("@typegoose/typegoose");
let RefDocValidator = class RefDocValidator {
    async validate(refId, args) {
        const modelClass = args.constraints[0];
        return await (0, typegoose_1.getModelForClass)(modelClass).exists({ _id: refId });
    }
    defaultMessage() {
        return "Referenced Document not found!";
    }
};
RefDocValidator = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: "RefDoc", async: true })
], RefDocValidator);
function RefDocExists(modelClass, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: "RefDocExists",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [modelClass],
            options: validationOptions,
            validator: RefDocValidator,
        });
    };
}
exports.RefDocExists = RefDocExists;
