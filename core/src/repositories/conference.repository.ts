import { Service } from "typedi";
import { Repository } from "./base.repository";
import { Conference } from "../entitites/Conference";
import {
  ConferenceArgs,
  ConferenceConnection,
} from "../resolvers/types/conference.types";
import {
  buildCursorFilter,
  decodeCursor,
  encodeCursor,
  ensureIdSort,
  SortField,
} from "../resolvers/types/pagination.types";

@Service()
export class ConferenceRepository extends Repository<typeof Conference> {
  constructor() {
    super(Conference);
  }

  async paginatedConferences({
    first,
    after,
    sort,
  }: ConferenceArgs): Promise<ConferenceConnection> {
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

    const [connection] = await this.aggregate<ConferenceConnection>([
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
            { $skip: first || 20 },
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

  async textSearch(text: string) {
    return await this.aggregate([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id", "tickets.id": "$tickets._id" } },
      { $limit: 10 },
    ]);
  }
}
