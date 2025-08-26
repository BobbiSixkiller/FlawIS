import { Service } from "typedi";

import { Repository } from "./base.repository";
import { CourseAttendee } from "../entitites/Course";
import {
  CourseAttendeeArgs,
  CourseAttendeeConnection,
} from "../resolvers/types/course.types";
import {
  buildCursorFilter,
  decodeCursor,
  encodeCursor,
  ensureIdSort,
  SortField,
} from "../resolvers/types/pagination.types";

@Service()
export class CourseAttendeeRepository extends Repository<
  typeof CourseAttendee
> {
  constructor() {
    super(CourseAttendee);
  }

  async paginatedCourseTermAttendees({
    first,
    after,
    sort,
    filter,
  }: CourseAttendeeArgs): Promise<CourseAttendeeConnection> {
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

    const [connection] = await this.aggregate<CourseAttendeeConnection>([
      { $match: { ...(filter?.termId ? { term: filter?.termId } : {}) } },
      { $sort: mongoSort },
      {
        $facet: {
          data: [
            { $match: { ...cursorFilter } },
            { $limit: first },
            { $addFields: { id: "$_id" } },
          ],
          hasNextPage: [
            { $match: { ...cursorFilter } },
            { $skip: first },
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
}
