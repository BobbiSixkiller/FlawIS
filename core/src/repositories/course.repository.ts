import { Service } from "typedi";
import { Repository } from "./repository";
import { Course } from "../entitites/Course";
import { CourseArgs, CourseConnection } from "../resolvers/types/course";

@Service()
export class CourseRepository extends Repository<typeof Course> {
  constructor() {
    super(Course);
  }

  async paginatedCourses({ first, after }: CourseArgs) {
    const [connection] = await this.aggregate<CourseConnection>([
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $limit: first },
          ],
          hasNextPage: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $skip: first },
            { $limit: 1 },
          ],
          totalCount: [{ $count: "totalCount" }],
        },
      },
      {
        $project: {
          totalCount: { $arrayElemAt: ["$totalCount.totalCount", 0] }, // Extract totalCount value
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

    return (
      connection ?? {
        edges: [],
        pageInfo: { hasNextPage: false },
        totalCount: 0,
      }
    );
  }
}
