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
exports.CRUDservice = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const typedi_1 = require("typedi");
let CRUDservice = class CRUDservice {
    constructor(entity) {
        this.dataModel = (0, typegoose_1.getModelForClass)(entity);
    }
    async aggregate(pipeline = []) {
        return await this.dataModel.aggregate(pipeline).exec();
    }
    async exists(filter) {
        return await this.dataModel.exists(filter);
    }
    async findAll(filter, projection, options) {
        return await this.dataModel.find(filter, projection, options).exec();
    }
    async findOne(filter, projection, options) {
        return await this.dataModel.findOne(filter, projection, options).exec();
    }
    async update(filter, update, options) {
        return await this.dataModel.updateMany(filter, update, options).exec();
    }
    async create(data) {
        return await this.dataModel.create(data);
    }
    async delete(filter) {
        return await this.dataModel.deleteMany(filter).exec();
    }
};
CRUDservice = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [Object])
], CRUDservice);
exports.CRUDservice = CRUDservice;
