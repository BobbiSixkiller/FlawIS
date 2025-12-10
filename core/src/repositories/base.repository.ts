import { getModelForClass, types, ReturnModelType } from "@typegoose/typegoose";
import * as mongoose from "mongoose";
import { Service } from "typedi";

@Service()
export class Repository<E extends types.AnyParamConstructor<any>> {
  private readonly dataModel: ReturnModelType<E>;

  constructor(entity: E) {
    this.dataModel = getModelForClass(entity);
  }

  async aggregate<T>(pipeline: mongoose.PipelineStage[] = []) {
    return await this.dataModel.aggregate<T>(pipeline);
  }

  async exists(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >
  ) {
    return await this.dataModel.exists(filter);
  }

  async findAll(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    projection?: Object | String | Array<String> | null,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel.find(filter, projection, options);
  }

  async findOne(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    projection?: Object | String | Array<String> | null,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel.findOne(filter, projection, options);
  }

  async findOneAndUpdate(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    update:
      | mongoose.UpdateWithAggregationPipeline
      | mongoose.UpdateQuery<
          types.DocumentType<InstanceType<E>, types.BeAnObject>
        >,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel
      .findOneAndUpdate(filter, update, options)
      .exec();
  }

  async findOneAndDelete(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    options?: mongoose.QueryOptions | null
  ) {
    return await this.dataModel.findOneAndDelete(filter, options);
  }

  async updateMany(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    update:
      | mongoose.UpdateWithAggregationPipeline
      | mongoose.UpdateQuery<
          types.DocumentType<InstanceType<E>, types.BeAnObject>
        >,
    options?: mongoose.mongo.UpdateOptions | undefined
  ) {
    return await this.dataModel.updateMany(filter, update, options);
  }

  async create(
    data: mongoose.AnyKeys<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    options?: { session?: mongoose.ClientSession }
  ): Promise<types.DocumentType<InstanceType<E>, types.BeAnObject>> {
    const doc = new this.dataModel(data);
    return await doc.save({ session: options?.session });
  }

  async deleteOne(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    options?: { session?: mongoose.ClientSession }
  ) {
    return await this.dataModel.deleteOne(filter, options);
  }

  async deleteMany(
    filter: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    options?: { session?: mongoose.ClientSession }
  ) {
    return await this.dataModel.deleteMany(filter, options);
  }

  async countDocuments(
    filter?: mongoose.FilterQuery<
      types.DocumentType<InstanceType<E>, types.BeAnObject>
    >,
    options?: mongoose.mongo.CountOptions
  ) {
    return await this.dataModel.countDocuments(filter, options);
  }
}
