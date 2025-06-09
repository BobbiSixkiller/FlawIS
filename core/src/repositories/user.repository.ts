import { Service } from "typedi";
import { Repository } from "./base.repository";
import { User } from "../entitites/User";
import { UserArgs, UserConnection } from "../resolvers/types/user.types";

@Service()
export class UserRepository extends Repository<typeof User> {
  constructor() {
    super(User);
  }

  async paginatedUsers({ first, access, after }: UserArgs) {
    const [connection] = await this.aggregate<UserConnection>([
      { $sort: { _id: -1 } },
      {
        $match: {
          ...(access ? { access: { $in: access } } : {}),
        },
      },
      {
        $facet: {
          data: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $limit: first || 20 },
            { $unset: "password" },
            { $addFields: { id: "$_id" } },
          ],
          hasNextPage: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
          ],
          totalCount: [{ $count: "totalCount" }], // Count all documents,
        },
      },
      {
        $project: {
          totalCount: { $arrayElemAt: ["$totalCount.totalCount", 0] }, // Extract totalCount value
          edges: {
            $map: {
              input: "$data",
              as: "edge",
              in: { cursor: "$$edge._id", node: "$$edge" },
            },
          },
          pageInfo: {
            hasNextPage: { $eq: [{ $size: "$hasNextPage" }, 1] },
            endCursor: { $last: "$data._id" },
          },
        },
      },
    ]);

    return (
      connection ?? {
        totalCount: 0,
        edges: [],
        pageInfo: { hasNextPage: false },
      }
    );
  }

  async textSearch(text: string) {
    return await this.aggregate<User>([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id" } },
      { $unset: "password" },
      { $limit: 10 },
    ]);
  }
}
