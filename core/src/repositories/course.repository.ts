import { Service } from "typedi";
import { Repository } from "./base.repository";
import { Course } from "../entitites/Course";
import {
  CourseArgs,
  CourseConnection,
} from "../resolvers/types/course/course.types";
import {
  buildCursorFilter,
  decodeCursor,
  encodeCursor,
  ensureIdSort,
} from "../resolvers/types/pagination.types";

@Service()
export class CourseRepository extends Repository<typeof Course> {
  constructor() {
    super(Course);
  }

  async paginatedCourses({
    first,
    after,
    sort,
    filter,
  }: CourseArgs): Promise<CourseConnection> {
    // 1. Build Mongo sort object + sortFields for cursor filter
    const sortFields = ensureIdSort(
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

    const categoryMatch = filter?.categoryIds?.length
      ? { categories: { $in: filter.categoryIds } }
      : {};

    const [connection] = await this.aggregate<CourseConnection>([
      { $sort: mongoSort },
      {
        $facet: {
          data: [
            { $match: { ...categoryMatch, ...cursorFilter } },
            { $limit: first },
            { $addFields: { id: "$_id" } },
          ],
          hasNextPage: [
            { $match: { ...categoryMatch, ...cursorFilter } },
            { $skip: first },
            { $limit: 1 },
          ],
          totalCount: [
            { $match: { ...categoryMatch } },
            { $count: "totalCount" },
          ],
          availableCategories: [
            { $unwind: "$categories" },
            { $group: { _id: "$categories", count: { $sum: 1 } } },
            {
              $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "category",
              },
            },
            { $unwind: "$category" },
            { $sort: { "category.name": 1 } },
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
          availableCategories: {
            $map: {
              input: "$availableCategories",
              as: "item",
              in: {
                id: "$$item._id",
                name: "$$item.category.name",
                slug: "$$item.category.slug",
                count: "$$item.count",
              },
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
      availableCategories: connection?.availableCategories ?? [],
    };
  }
}
