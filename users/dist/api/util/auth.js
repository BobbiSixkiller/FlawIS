"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authChecker = exports.verifyJwt = exports.signJwt = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function signJwt(object, options) {
    return (0, jsonwebtoken_1.sign)(object, process.env.SECRET || "JWT_SECRET", {
        ...(options && options),
    });
}
exports.signJwt = signJwt;
function verifyJwt(token) {
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, process.env.SECRET || "JWT_SECRET");
        return decoded;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}
exports.verifyJwt = verifyJwt;
const authChecker = ({ args, context: { user } }, roles) => {
    //checks for user inside the context
    if (roles.length === 0) {
        return user !== null;
    }
    //roles exists but no user in the context
    if (!user)
        return false;
    //check if user role matches the defined role
    if (roles.some((role) => user.role === role))
        return true;
    //check if user permissions property contains some defined role
    if (roles.some((role) => role === "IS_OWN_USER"))
        return args.id.toString() === user.id;
    //no roles matched
    return false;
};
exports.authChecker = authChecker;
