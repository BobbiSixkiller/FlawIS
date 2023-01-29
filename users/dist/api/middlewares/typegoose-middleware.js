"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformIds = exports.TypegooseMiddleware = void 0;
const mongoose_1 = require("mongoose");
const typegoose_1 = require("@typegoose/typegoose");
const TypegooseMiddleware = async ({ context }, next) => {
    const result = await next();
    const { locale } = context;
    if (Array.isArray(result)) {
        return result.map((item) => item instanceof mongoose_1.Model ? convertDocument(item, locale) : item);
    }
    if (result instanceof mongoose_1.Model) {
        return convertDocument(result, locale);
    }
    return result;
};
exports.TypegooseMiddleware = TypegooseMiddleware;
function transformIds(doc) {
    const transformed = [];
    for (let [key, value] of Object.entries(doc)) {
        if (key === "_id")
            key = "id";
        if (typeof value === "object" && (value === null || value === void 0 ? void 0 : value.hasOwnProperty("_id"))) {
            value = transformIds(value);
        }
        if (typeof value === "object" &&
            Array.isArray(value) &&
            !value.every((i) => typeof i === "string" || mongoose_1.Types.ObjectId.isValid(i))) {
            console.log(value);
            value = value.map((v) => transformIds(v));
        }
        transformed.push([key, value]);
    }
    return Object.fromEntries(transformed);
}
exports.transformIds = transformIds;
function convertDocument(doc, locale) {
    const convertedDocument = transformIds(doc.toObject());
    const DocumentClass = (0, typegoose_1.getClassForDocument)(doc);
    Object.setPrototypeOf(convertedDocument, DocumentClass.prototype);
    return convertedDocument;
}
