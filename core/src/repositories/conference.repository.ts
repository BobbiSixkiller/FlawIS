import { Service } from "typedi";

import { Repository } from "./repository";
import { Conference } from "../entitites/Conference";
import {
  ConferenceArgs,
  ConferenceConnection,
} from "../resolvers/types/conference";

@Service()
export class ConferenceRepository extends Repository<typeof Conference> {
  constructor() {
    super(Conference);
  }

  async paginatedConferences({ first, after }: ConferenceArgs) {
    const [connection] = await this.aggregate<ConferenceConnection>([
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            {
              $match: { ...(after ? { _id: { $lt: after } } : {}) },
            },
            { $limit: first || 20 },
            { $addFields: { id: "$_id" } },
          ],
          hasNextPage: [
            {
              $match: { ...(after ? { _id: { $lt: after } } : {}) },
            },
            { $skip: first || 20 },
            { $limit: 1 },
          ],
          totalCount: [{ $count: "totalCount" }],
        },
      },
      {
        $project: {
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.totalCount", 0] }, 0],
          },
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
        edges: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false },
      }
    );
  }

  async textSearch(text: string) {
    await this.aggregate([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id", "tickets.id": "$tickets._id" } },
      { $limit: 10 },
    ]);
  }
}
