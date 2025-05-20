import { Service } from "typedi";
import { Intern, Internship, Status } from "../entitites/Internship";
import { InternArgs, InternConnection } from "../resolvers/types/internship";
import { Repository } from "./repository";
import { User } from "../entitites/User";
import { getAcademicYear } from "../util/helpers";

@Service()
export class InternRepository extends Repository<typeof Intern> {
  constructor() {
    super(Intern);
  }

  async paginatedInterns({
    first,
    after,
    endDate,
    startDate,
    internship,
    status,
    user,
  }: InternArgs) {
    const [connection] = await this.aggregate<InternConnection>([
      {
        $match: {
          ...(internship ? { internship } : {}),
          ...(user ? { "user._id": user } : {}),
          ...(status ? { status: { $in: status } } : {}),
          ...(endDate ? { createdAt: { $lte: endDate } } : {}),
          ...(startDate ? { createdAt: { $gte: startDate } } : {}),
        },
      },
      { $sort: { _id: 1 } },
      {
        $facet: {
          data: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $limit: first },
            { $addFields: { id: "$_id", "user.id": "$user._id" } },
            {
              $project: {
                _id: 0, // drop the raw _id
                "user._id": 0,
                __v: 0,
              },
            },
          ],
          hasNextPage: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $skip: first },
            { $limit: 1 }, // Check if more data exists
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
        edges: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false },
      }
    );
  }

  async internshipsWithEligibleInterns(): Promise<
    { count: number; internship: Internship; user: User }[]
  > {
    const { startDate, endDate } = getAcademicYear();

    return await this.aggregate<{
      count: number;
      internship: Internship;
      user: User;
    }>([
      {
        $match: {
          status: Status.Eligible,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$internship",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "internships",
          localField: "_id",
          foreignField: "_id",
          as: "internship",
        },
      },
      {
        $unwind: {
          path: "$internship",
          preserveNullAndEmptyArrays: false,
        },
      },
      { $addFields: { "internship.id": "$internship._id" } },
      {
        $lookup: {
          from: "users",
          localField: "internship.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
    ]);
  }
}
