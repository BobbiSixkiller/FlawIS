import { Arg, Authorized, Ctx, FieldResolver, Resolver } from "type-graphql";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";
import { ObjectId } from "mongodb";

import { GrantInfo, User } from "../entitites/User";
import { Grant } from "../entitites/Grant";

import { Context } from "../util/auth";

import env from "dotenv";

env.config();

@Service()
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly grantService = new CRUDservice(Grant)) {}

  @Authorized()
  @FieldResolver(() => GrantInfo)
  async grants(@Arg("year") year: Date, @Ctx() { user }: Context) {
    //return count of numbers spent as a grant member based on selected year
    const data = await this.grantService.aggregate([
      {
        $match: {
          end: { $gte: year },
          "budgets.members.user": new ObjectId(user?.id),
        },
      },
      {
        $facet: {
          grants: [{ $sort: { _id: -1 } }, { $addFields: { id: "$_id" } }],
          hours: [
            { $unwind: "$budgets" },
            {
              $match: {
                $expr: { $eq: [{ $year: "$budgets.year" }, { $year: year }] },
              },
            },
            { $unwind: "$budgets.members" },
          ],
          availableYears: [
            { $unwind: "$budgets" },
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
          availableYears: { $first: "$availableYears.years" },
        },
      },
    ]);

    console.log(data[0]);

    return data[0];
  }
}
