import { getModelForClass, types, ReturnModelType } from "@typegoose/typegoose";
import * as mongoose from "mongoose";
import { Service } from "typedi";

@Service()
export class TypegooseService<U extends types.AnyParamConstructor<any>> {
  readonly dataModel: ReturnModelType<U>;

  constructor(entity: U) {
    this.dataModel = getModelForClass(entity);
  }

  async aggregate<T>(pipeline: mongoose.PipelineStage[] = []) {
    return await this.dataModel.aggregate<T>(pipeline).exec();
  }

  async exists(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >
  ) {
    return await this.dataModel.exists(filter);
  }

  async findAll(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >,
    projection?: Object | String | Array<String> | null,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel.find(filter, projection, options).exec();
  }

  async findOne(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >,
    projection?: Object | String | Array<String> | null,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel.findOne(filter, projection, options).exec();
  }

  async findOneAndUpdate(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >,
    update:
      | mongoose.UpdateWithAggregationPipeline
      | mongoose.UpdateQuery<
          types.DocumentType<InstanceType<U>, types.BeAnObject>
        >,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel
      .findOneAndUpdate(filter, update, options)
      .exec();
  }

  async findOneAndDelete(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel.findOneAndDelete(filter, options).exec();
  }

  async update(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >,
    update:
      | mongoose.UpdateWithAggregationPipeline
      | mongoose.UpdateQuery<
          types.DocumentType<InstanceType<U>, types.BeAnObject>
        >,
    options?: mongoose.mongo.UpdateOptions | undefined
  ) {
    return await this.dataModel.updateMany(filter, update, options).exec();
  }

  async create(
    data: mongoose.AnyKeys<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >
  ) {
    return await this.dataModel.create(data);
  }

  async delete(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<U>, types.BeAnObject>
    >
  ) {
    return await this.dataModel.deleteOne(filter).exec();
  }
}
