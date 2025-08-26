import { Service } from "typedi";
import { Repository } from "./base.repository";
import { User } from "../entitites/User";
import { UserArgs, UserConnection } from "../resolvers/types/user.types";
import {
  buildCursorFilter,
  decodeCursor,
  encodeCursor,
  ensureIdSort,
  SortField,
} from "../resolvers/types/pagination.types";

@Service()
export class UserRepository extends Repository<typeof User> {
  constructor() {
    super(User);
  }

  async paginatedUsers({
    first,
    after,
    filter,
    sort,
  }: UserArgs): Promise<UserConnection> {
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

    const [connection] = await this.aggregate<UserConnection>([
      {
        $match: {
          ...(filter?.access ? { access: { $in: filter?.access } } : {}),
        },
      },
      { $sort: mongoSort },
      {
        $facet: {
          data: [
            { $match: { ...cursorFilter } },
            { $limit: first || 20 },
            { $unset: "password" },
            { $addFields: { id: "$_id" } },
          ],
          hasNextPage: [
            { $match: { ...cursorFilter } },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
          ],
          totalCount: [{ $count: "totalCount" }], // Count all documents,
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

  async textSearch(text: string) {
    return await this.aggregate<User>([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id" } },
      { $unset: "password" },
      { $limit: 10 },
    ]);
  }
}
