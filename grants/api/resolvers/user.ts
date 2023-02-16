import { Arg, Authorized, Ctx, FieldResolver, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";
import { ObjectId } from "mongodb";

import { GrantInfo, User } from "../entitites/User";
import { Grant } from "../entitites/Grant";

import { Context } from "../util/auth";

import env from "dotenv";
import { DocumentType } from "@typegoose/typegoose";

env.config();

@Service()
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly grantService = new CRUDservice(Grant)) { }

  @Authorized()
  @FieldResolver(() => GrantInfo)
  async grants(
    @Root() user: DocumentType<User>,
    @Arg("year", { nullable: true }) year?: Date,
  ) {
    //return count of numbers spent as a grant member based on selected year
    const data = await this.grantService.aggregate([
      {
        $match: {
          "budgets.members.user": new ObjectId(user.id),
        },
      },
      { $unwind: "$budgets" },
      {
        $facet: {
          grants: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [year, null] }, //if no year is supplied return all budgets
                    { $ne: ["$_id", null] },
                    { $eq: [{ $year: "$budgets.year" }, { $year: year }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                type: { $first: "$type" },
                start: { $first: "$start" },
                end: { $first: "$end" },
                announcements: { $first: "$announcements" },
                budgets: { $push: "$budgets" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
              },
            },
            { $sort: { _id: -1 } },
            { $addFields: { id: "$_id" } },
          ],
          hours: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [year, null] }, //if no year is supplied return all budgets
                    { $ne: ["$_id", null] },
                    { $eq: [{ $year: "$budgets.year" }, { $year: year }] },
                  ],
                },
              },
            },
            { $unwind: "$budgets.members" },
            { $match: { "budgets.members.user": new ObjectId(user.id) } }
          ],
          availableYears: [
            { $match: { "budgets.members.user": new ObjectId(user.id) } },
            { $group: { _id: null, years: { $addToSet: "$budgets.year" } } },
          ],
        },
      },
      {
        $project: {
          grants: "$grants",
          hours: {
            $reduce: {
              input: "$hours",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.budgets.members.hours"] },
            },
          },
          availableYears: {
            $ifNull: [{ $first: "$availableYears.years" }, []],
          },
        },
      },
    ]);


    return data[0];
  }
}
