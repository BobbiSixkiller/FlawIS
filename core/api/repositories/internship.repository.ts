import { Service } from "typedi";
import { Internship } from "../entitites/Internship";
import {
  InternshipArgs,
  InternshipConnection,
} from "../resolvers/types/internship";
import { Repository } from "./repository";

@Service()
export class InternshipRepository extends Repository<typeof Internship> {
  constructor() {
    super(Internship);
  }

  async paginatedInternships({
    first = 20,
    after,
    endDate,
    startDate,
    user,
    academicYear,
    contextUserId,
  }: InternshipArgs) {
    const [connection] = await this.aggregate<InternshipConnection>([
      {
        $facet: {
          data: [
            {
              $match: {
                ...(user ? { user } : {}),
                ...(endDate ? { createdAt: { $lte: endDate } } : {}),
                ...(startDate ? { createdAt: { $gte: startDate } } : {}),
                ...(academicYear ? { academicYear } : {}),
                ...(after ? { _id: { $lt: after } } : {}),
              },
            },
            ...(contextUserId
              ? [
                  {
                    $lookup: {
                      from: "interns", // Collection name for Intern
                      let: { internshipId: "$_id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$internship", "$$internshipId"] },
                                { $eq: ["$user._id", contextUserId] },
                              ],
                            },
                          },
                        },
                        { $limit: 1 }, // Only need one application per internship
                      ],
                      as: "myApplication",
                    },
                  },
                  {
                    $addFields: {
                      myApplication: { $arrayElemAt: ["$myApplication", 0] },
                      hasApplication: {
                        $cond: {
                          if: { $gt: [{ $size: "$myApplication" }, 0] },
                          then: 1,
                          else: 0,
                        },
                      },
                    },
                  },
                  {
                    $sort: { hasApplication: -1 as -1, createdAt: 1 as -1 }, // Sort by application first, then by creation date
                  },
                ]
              : []),
            { $limit: first },
          ],
          hasNextPage: [
            {
              $match: {
                ...(user ? { user } : {}),
                ...(endDate ? { createdAt: { $lte: endDate } } : {}),
                ...(startDate ? { createdAt: { $gte: startDate } } : {}),
                ...(academicYear ? { academicYear } : {}),
                ...(after ? { _id: { $lt: after } } : {}),
              },
            },
            { $skip: first },
            { $limit: 1 }, // Check if more data exists
          ],
          totalCount: [{ $count: "totalCount" }],
          academicYearCount: [{ $sortByCount: "$academicYear" }],
        },
      },
      {
        $project: {
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.totalCount", 0] }, 0],
          },
          academicYears: {
            $map: {
              input: "$academicYearCount",
              as: "item",
              in: { academicYear: "$$item._id", count: "$$item.count" },
            },
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
        academicYears: [],
        edges: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false },
      }
    );
  }
}
