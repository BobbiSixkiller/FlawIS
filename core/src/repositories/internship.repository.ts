import { Service } from "typedi";
import { Repository } from "./base.repository";
import { Internship } from "../entitites/Internship";
import {
  InternshipArgs,
  InternshipConnection,
} from "../resolvers/types/internship.types";
import { CtxUser } from "../util/types";
import { Access } from "../entitites/User";
import { getAcademicYear } from "../util/helpers";

@Service()
export class InternshipRepository extends Repository<typeof Internship> {
  constructor() {
    super(Internship);
  }

  async paginatedInternships(
    { first = 20, after, filter }: InternshipArgs,
    ctxUser: CtxUser | null
  ) {
    const [connection] = await this.aggregate<InternshipConnection>([
      {
        $match: {
          ...(filter?.user ? { user: filter.user } : {}),
          ...(filter?.endDate ? { createdAt: { $lte: filter.endDate } } : {}),
          ...(filter?.startDate
            ? { createdAt: { $gte: filter.startDate } }
            : {}),
        },
      },
      {
        $facet: {
          data: [
            {
              $match: {
                ...(after ? { _id: { $lt: after } } : {}),
                ...(filter?.academicYear
                  ? { academicYear: filter.academicYear }
                  : {}),
                ...(filter?.organizations
                  ? { organization: { $in: filter.organizations } }
                  : {}),
              },
            },
            ...(ctxUser?.access.includes(Access.Student)
              ? [
                  {
                    $lookup: {
                      from: "interns",
                      let: { internshipId: "$_id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$internship", "$$internshipId"] },
                                { $eq: ["$user._id", ctxUser?.id] },
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
            {
              $addFields: {
                id: "$_id", // copy _id ⇒ id
              },
            },
            {
              $project: {
                _id: 0, // drop the raw _id
                __v: 0,
              },
            },
          ],
          hasNextPage: [
            {
              $match: {
                ...(after ? { _id: { $lt: after } } : {}),
                ...(filter?.academicYear
                  ? { academicYear: filter.academicYear }
                  : {}),
                ...(filter?.organizations
                  ? { organization: { $in: filter.organizations } }
                  : {}),
              },
            },
            { $skip: first },
            { $limit: 1 }, // Check if more data exists
          ],
          totalCount: [{ $count: "totalCount" }],
          academicYearCount: [{ $sortByCount: "$academicYear" }],
          organizationsCount: [
            {
              $match: {
                ...(filter?.academicYear
                  ? { academicYear: filter.academicYear }
                  : {}),
              },
            },
            { $sortByCount: "$organization" },
          ],
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
          organizations: {
            $map: {
              input: "$organizationsCount",
              as: "item",
              in: { organization: "$$item._id", count: "$$item.count" },
            },
          },
          edges: {
            $map: {
              input: "$data",
              as: "edge",
              in: { cursor: "$$edge.id", node: "$$edge" },
            },
          },
          pageInfo: {
            hasNextPage: { $eq: [{ $size: "$hasNextPage" }, 1] },
            endCursor: { $last: "$data.id" },
          },
        },
      },
    ]);

    return (
      connection ?? {
        academicYears: [],
        organizations: [],
        edges: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false },
      }
    );
  }

  async internshipExport() {
    const { academicYear } = getAcademicYear();
  }
}
