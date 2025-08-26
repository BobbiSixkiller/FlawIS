import { Service } from "typedi";
import { Repository } from "./base.repository";
import { Submission } from "../entitites/Submission";
import {
  SubmissionArgs,
  SubmissionConnection,
} from "../resolvers/types/submission.types";
import {
  buildCursorFilter,
  decodeCursor,
  encodeCursor,
  ensureIdSort,
  SortField,
} from "../resolvers/types/pagination.types";

@Service()
export class SubmissionRepository extends Repository<typeof Submission> {
  constructor() {
    super(Submission);
  }

  async paginatedSubmissions({
    first,
    after,
    filter,
    sort,
  }: SubmissionArgs): Promise<SubmissionConnection> {
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

    const [connection] = await this.aggregate<SubmissionConnection>([
      {
        $match: {
          ...(filter?.conferenceId ? { conference: filter.conferenceId } : {}),
          ...(filter?.sectionIds && filter.sectionIds.length > 0
            ? { section: { $in: filter.sectionIds } }
            : {}),
        },
      },
      { $sort: mongoSort },
      {
        $facet: {
          data: [
            {
              $match: { ...cursorFilter },
            },
            { $limit: first || 20 },
            { $addFields: { id: "$_id" } },
          ],
          hasNextPage: [
            {
              $match: { ...cursorFilter },
            },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
          ],
          totalCount: [{ $count: "totalCount" }], // Count matching documents,
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
