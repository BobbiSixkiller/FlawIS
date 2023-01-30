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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const type_graphql_1 = require("type-graphql");
//generic function for creating corresponding Connection Type enabling relay style pagination
function CreateConnection(TNodeClass) {
    // `isAbstract` decorator option is mandatory to prevent registering in schema
    let Edge = class Edge {
    };
    __decorate([
        (0, type_graphql_1.Field)(() => TNodeClass) // here we use the runtime argument
        ,
        __metadata("design:type", Object)
    ], Edge.prototype, "node", void 0);
    __decorate([
        (0, type_graphql_1.Field)(),
        __metadata("design:type", mongodb_1.ObjectId)
    ], Edge.prototype, "cursor", void 0);
    Edge = __decorate([
        (0, type_graphql_1.ObjectType)(`${TNodeClass.name}Edge`)
    ], Edge);
    let PageInfo = class PageInfo {
    };
    __decorate([
        (0, type_graphql_1.Field)(),
        __metadata("design:type", mongodb_1.ObjectId)
    ], PageInfo.prototype, "endCursor", void 0);
    __decorate([
        (0, type_graphql_1.Field)(),
        __metadata("design:type", Boolean)
    ], PageInfo.prototype, "hasNextPage", void 0);
    PageInfo = __decorate([
        (0, type_graphql_1.ObjectType)({ isAbstract: true })
    ], PageInfo);
    let Connection = class Connection {
    };
    __decorate([
        (0, type_graphql_1.Field)(() => [Edge], { nullable: "items" }),
        __metadata("design:type", Array)
    ], Connection.prototype, "edges", void 0);
    __decorate([
        (0, type_graphql_1.Field)(() => PageInfo),
        __metadata("design:type", PageInfo)
    ], Connection.prototype, "pageInfo", void 0);
    Connection = __decorate([
        (0, type_graphql_1.ObjectType)({ isAbstract: true })
    ], Connection);
    return Connection;
}
exports.default = CreateConnection;
