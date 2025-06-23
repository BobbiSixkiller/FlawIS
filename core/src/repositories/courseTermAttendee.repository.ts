import { Service } from "typedi";

import { Repository } from "./base.repository";
import { CourseAttendee } from "../entitites/Course";
import {
  CourseAttendeeArgs,
  CourseAttendeeConnection,
} from "../resolvers/types/course.types";

@Service()
export class CourseAttendeeRepository extends Repository<
  typeof CourseAttendee
> {
  constructor() {
    super(CourseAttendee);
  }

  async paginatedCourseTermAttendees({
    termId,
    first,
    after,
  }: CourseAttendeeArgs) {
    const [connection] = await this.aggregate<CourseAttendeeConnection>([
      { $match: { term: termId } },
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $limit: first },
            { $addFields: { id: "$_id" } },
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
