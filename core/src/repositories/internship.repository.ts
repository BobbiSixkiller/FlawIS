import { Service } from "typedi";
import { Repository } from "./base.repository";
import { Internship } from "../entitites/Internship";
import {
  InternshipArgs,
  InternshipConnection,
} from "../resolvers/types/internship.types";
import { CtxUser } from "../util/types";
import { Access } from "../entitites/User";
import {
  buildCursorFilter,
  encodeCursor,
  decodeCursor,
  SortField,
  ensureIdSort,
} from "../resolvers/types/pagination.types";

@Service()
export class InternshipRepository extends Repository<typeof Internship> {
  constructor() {
    super(Internship);
  }

  async paginatedInternships(
    { first = 20, after, filter, sort }: InternshipArgs,
    ctxUser: CtxUser | null
  ) {
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

    const [connection] = await this.aggregate<
      InternshipConnection & { nextEdge: Internship }
    >([
      {
        $match: {
          ...(filter?.user ? { user: filter.user } : {}),
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
                          {
                            $eq: ["$user._id", ctxUser.id],
                          },
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
          ]
        : []),
      { $sort: mongoSort },
      {
        $facet: {
          data: [
            {
              $match: {
                ...(filter?.endDate
                  ? { createdAt: { $lte: filter.endDate } }
                  : {}),
                ...(filter?.startDate
                  ? { createdAt: { $gte: filter.startDate } }
                  : {}),
                ...(filter?.academicYear
                  ? { academicYear: filter.academicYear }
                  : {}),
                ...(filter?.organizations
                  ? { organization: { $in: filter.organizations } }
                  : {}),
                ...cursorFilter,
              },
            },
            { $limit: first },
            {
              $addFields: {
                id: "$_id", // copy _id ⇒ id
              },
            },
          ],
          hasNextPage: [
            {
              $match: {
                ...(filter?.endDate
                  ? { createdAt: { $lte: filter.endDate } }
                  : {}),
                ...(filter?.startDate
                  ? { createdAt: { $gte: filter.startDate } }
                  : {}),
                ...(filter?.academicYear
                  ? { academicYear: filter.academicYear }
                  : {}),
                ...(filter?.organizations
                  ? { organization: { $in: filter.organizations } }
                  : {}),
                ...cursorFilter,
              },
            },
            { $skip: first },
            { $limit: 1 }, // Check if more data exists
            {
              $addFields: {
                id: "$_id", // copy _id ⇒ id
              },
            },
          ],
          totalCount: [{ $count: "totalCount" }],
          academicYearCount: [
            { $group: { _id: "$academicYear", count: { $sum: 1 } } },
            { $sort: { _id: -1 } }, // sorts "2025/2026" > "2024/2025"
          ],
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
          edges: {
            $map: {
              input: "$data",
              as: "edge",
              in: { cursor: "$$edge.id", node: "$$edge" },
            },
          },
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
          pageInfo: {
            hasNextPage: { $eq: [{ $size: "$hasNextPage" }, 1] },
          },
          nextEdge: { $arrayElemAt: ["$hasNextPage", 0] },
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
      totalCount: connection?.totalCount ?? 0,
      academicYears: connection?.academicYears ?? [],
      organizations: connection?.organizations ?? [],
      pageInfo: { ...connection?.pageInfo, endCursor },
    };
  }
}
