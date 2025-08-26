import { Service } from "typedi";
import { Intern, Internship, Status } from "../entitites/Internship";
import {
  InternArgs,
  InternConnection,
} from "../resolvers/types/internship.types";
import { getAcademicYear } from "../util/helpers";
import { User } from "../entitites/User";
import { Repository } from "./base.repository";
import {
  buildCursorFilter,
  decodeCursor,
  encodeCursor,
  ensureIdSort,
  SortField,
} from "../resolvers/types/pagination.types";

@Service()
export class InternRepository extends Repository<typeof Intern> {
  constructor() {
    super(Intern);
  }

  async paginatedInterns({
    first,
    after,
    filter,
    sort,
  }: InternArgs): Promise<InternConnection> {
    // 1. Build Mongo sort object + sortFields for cursor filter
    const sortFields: SortField[] = ensureIdSort(
      sort.map((s) => ({
        field: s.field as unknown as string,
        direction: s.direction,
      }))
    );

    const mongoSort = Object.fromEntries(
      sortFields.map((f) => [f.field, f.direction])
    );

    // 2. Cursor filter
    let cursorFilter = {};
    if (after) {
      const cursorValues = decodeCursor(after);
      cursorFilter = buildCursorFilter(sortFields, cursorValues);
    }

    const [connection] = await this.aggregate<InternConnection>([
      {
        $match: {
          ...(filter?.internship ? { internship: filter.internship } : {}),
          ...(filter?.user ? { "user._id": filter.user } : {}),
          ...(filter?.status ? { status: { $in: filter.status } } : {}),
          ...(filter?.endDate ? { createdAt: { $lte: filter.endDate } } : {}),
          ...(filter?.startDate
            ? { createdAt: { $gte: filter.startDate } }
            : {}),
        },
      },
      { $sort: mongoSort },
      {
        $facet: {
          data: [
            { $match: { ...cursorFilter } },
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
            { $match: { ...cursorFilter } },
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

    // Now build edges with dynamic cursor generation
    const edges = connection?.edges.map((edge: any) => {
      const cursorFields = Object.fromEntries(
        sortFields.map((f) => [f.field, edge.node[f.field]])
      );

      return {
        node: edge.node,
        cursor: encodeCursor(cursorFields),
      };
    });

    const endCursor = edges.length ? edges[edges.length - 1].cursor : undefined;

    return {
      edges,
      pageInfo: { ...connection.pageInfo, endCursor },
      totalCount: connection.totalCount,
    };
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
