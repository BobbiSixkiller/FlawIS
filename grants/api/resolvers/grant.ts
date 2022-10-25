import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import { User } from "../entitites/User";
import { Grant, GrantConnection } from "../entitites/Grant";

import env from "dotenv";
import { GrantArgs, GrantInput } from "./types/grant";

env.config();

@Service()
@Resolver(() => Grant)
export class GrantResolver {
  constructor(
    private readonly grantService = new CRUDservice(Grant),
    private readonly userService = new CRUDservice(User)
  ) {}

  @Authorized()
  @Query(() => GrantConnection)
  async grants(@Args() { after, first }: GrantArgs): Promise<GrantConnection> {
    const grants = await this.grantService.aggregate([
      {
        $facet: {
          $data: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["_id", after] },
                  ],
                },
              },
            },
            { $limit: first || 20 },
            { $sort: { _id: -1 } },
            { $addFields: { id: "$_id" } },
          ],
          $hasNextDoc: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["_id", after] },
                  ],
                },
              },
            },
            { $skip: first || 20 },
            { $limit: 1 },
          ],
        },
      },
      {
        $project: {
          edges: {
            $map: {
              input: "$data",
              as: "doc",
              in: { $project: { cursor: "$$doc._id", node: "$$doc" } },
            },
          },
          pageInfo: {
            endCursor: { $last: "$data._id" },
            hasNextPage: { $ne: [{ $first: "$hasNextDoc" }, null] },
          },
        },
      },
    ]);

    return grants[0] as GrantConnection;
  }

  @Authorized()
  @Query(() => Grant)
  async grant(@Arg("id") id: ObjectId): Promise<Grant> {
    const grant = await this.grantService.findOne({ _id: id });
    if (!grant) throw new Error("Grant not found!");

    return grant;
  }

  @Authorized()
  @Mutation(() => Grant)
  async createGrant(@Arg("data") grantInput: GrantInput): Promise<Grant> {
    return await this.grantService.create(grantInput);
  }

  @Authorized()
  @Mutation(() => Grant)
  async updategrant(
    @Arg("data") grantInput: GrantInput,
    @Arg("id") id: ObjectId
  ): Promise<Grant> {
    const grant = await this.grantService.findOne({ _id: id });
    if (!grant) throw new Error("Grant not found!");

    for (const [key, value] of Object.entries(grantInput)) {
      grant[key as keyof GrantInput] = value;
    }

    return await grant.save();
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteGrant(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.grantService.delete({ _id: id });
    return deletedCount > 0;
  }
}
