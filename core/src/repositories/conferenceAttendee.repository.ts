import { Service } from "typedi";
import { Repository } from "./base.repository";
import { Attendee } from "../entitites/Attendee";
import {
  AttendeeArgs,
  AttendeeConnection,
} from "../resolvers/types/attendee.types";
import {
  buildCursorFilter,
  decodeCursor,
  encodeCursor,
  ensureIdSort,
  SortField,
} from "../resolvers/types/pagination.types";

@Service()
export class AttendeeRepository extends Repository<typeof Attendee> {
  constructor() {
    super(Attendee);
  }

  async paginatedConferenceAttendees({
    first,
    after,
    filter,
    sort,
  }: AttendeeArgs): Promise<AttendeeConnection> {
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

    const [connection] = await this.aggregate<AttendeeConnection>([
      {
        $match: {
          ...(filter?.conferenceSlug
            ? { "conference.slug": filter.conferenceSlug }
            : {}),
        },
      },
      { $sort: mongoSort },
      {
        $lookup: {
          from: "submissions",
          let: {
            conference: "$conference",
            user: "$user",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$user._id", "$authors"] },
                    { $eq: ["$conference", "$$conference._id"] },
                  ],
                },
              },
            },
            // { $addFields: { id: "$$_id" } },
          ],
          as: "submissions",
        },
      },
      {
        $match: {
          $expr: {
            $cond: {
              if: {
                $or: [
                  { $ne: [{ $size: [filter?.sectionIds] }, 0] },
                  { $eq: [filter?.passive, true] },
                ],
              },
              then: {
                $or: [
                  {
                    $and: [
                      { $ne: [{ $size: [filter?.sectionIds] }, 0] }, // Include documents with specific submissions
                      {
                        $anyElementTrue: {
                          $map: {
                            input: "$submissions",
                            as: "nested",
                            in: {
                              $in: ["$$nested.section", filter?.sectionIds], // Complex condition involving nested array
                            },
                          },
                        },
                      },
                    ],
                  },
                  {
                    $and: [
                      { $eq: [filter?.passive, true] }, // Include documents with empty submissions
                      { $eq: [{ $size: "$submissions" }, 0] },
                    ],
                  },
                ],
              },
              else: {},
            },
          },
        },
      },
      {
        $facet: {
          data: [
            {
              $match: { ...cursorFilter },
            },
            { $limit: first || 20 },
            {
              $addFields: {
                id: "$_id",
                "submissions.id": "$submissions._id",
                "conference.id": "$conference._id",
                "user.id": "$user._id",
                "ticket.id": "$ticket._id",
              },
            },
          ],
          hasNextPage: [
            { $match: { ...cursorFilter } },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
          ],
          totalCount: [
            { $count: "totalCount" }, // Count matching documents
          ],
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
            hasNextPage: { $gt: [{ $size: "$hasNextPage" }, 0] }, // True if hasNextPage has at least one record
            endCursor: { $ifNull: [{ $last: "$data._id" }, null] }, // Fallback to null if no records
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

  async textSearch(text: string, slug: string) {
    return await this.aggregate([
      {
        $match: {
          $text: { $search: text },
          "conference.slug": slug, // Replace 'slug' with the variable holding the slug value
        },
      },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id", "user.id": "$user._id" } },
      { $limit: 10 },
    ]);
  }
}
