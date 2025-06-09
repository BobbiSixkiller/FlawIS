import { Service } from "typedi";
import { Repository } from "./base.repository";
import { Submission } from "../entitites/Submission";
import {
  SubmissionArgs,
  SubmissionConnection,
} from "../resolvers/types/submission.types";

@Service()
export class SubmissionRepository extends Repository<typeof Submission> {
  constructor() {
    super(Submission);
  }

  async paginatedSubmissions({
    first,
    after,
    conferenceId,
    sectionIds,
  }: SubmissionArgs) {
    const [connection] = await this.aggregate<SubmissionConnection>([
      {
        $match: {
          ...(conferenceId ? { conference: conferenceId } : {}),
          ...(sectionIds && sectionIds.length > 0
            ? { section: { $in: sectionIds } }
            : {}),
        },
      },
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
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
          ],
          totalCount: [{ $count: "totalCount" }], // Count matching documents,
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
}
