import { Service } from "typedi";
import { Attendee } from "../entitites/Attendee";
import { Repository } from "./repository";
import { AttendeeArgs, AttendeeConnection } from "../resolvers/types/attendee";

@Service()
export class AttendeeRepository extends Repository<typeof Attendee> {
  constructor() {
    super(Attendee);
  }

  async paginatedConferenceAttendees({
    conferenceSlug,
    first,
    after,
    sectionIds,
    passive,
  }: AttendeeArgs) {
    const [connection] = await this.aggregate<AttendeeConnection>([
      { $sort: { _id: -1 } },
      { $match: { "conference.slug": conferenceSlug } },
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
                  { $ne: [{ $size: [sectionIds] }, 0] },
                  { $eq: [passive, true] },
                ],
              },
              then: {
                $or: [
                  {
                    $and: [
                      { $ne: [{ $size: [sectionIds] }, 0] }, // Include documents with specific submissions
                      {
                        $anyElementTrue: {
                          $map: {
                            input: "$submissions",
                            as: "nested",
                            in: {
                              $in: ["$$nested.section", sectionIds], // Complex condition involving nested array
                            },
                          },
                        },
                      },
                    ],
                  },
                  {
                    $and: [
                      { $eq: [passive, true] }, // Include documents with empty submissions
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
              $match: { ...(after ? { _id: { $lt: after } } : {}) },
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
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["$_id", after] },
                  ],
                },
              },
            },
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

    return (
      connection ?? {
        edges: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false },
      }
    );
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
