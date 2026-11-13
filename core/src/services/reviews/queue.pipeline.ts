import { ObjectId } from "mongodb";
import type { PipelineStage } from "mongoose";

export type QueueFilters = {
  search?: string;
  stage?: string;
  reviewer?: string;
  delivery?: string;
};
type Collections = Record<
  | "users"
  | "cases"
  | "rounds"
  | "versions"
  | "assignments"
  | "revisions"
  | "notifications",
  string
>;

export function reviewQueuePipeline(
  match: Record<string, unknown>,
  names: Collections,
  actorIds: ObjectId[],
  required: number,
  filters: QueueFilters,
  after: ObjectId | undefined,
  first: number,
): PipelineStage[] {
  const lookup = (
    from: string,
    localField: string,
    foreignField: string,
    as: string,
  ) => ({ $lookup: { from, localField, foreignField, as } });
  const stages: PipelineStage[] = [
    { $match: match },
    lookup(names.users, "authors", "_id", "people"),
    lookup(names.cases, "_id", "submission", "cases"),
    { $set: { review: { $first: "$cases" } } },
    {
      $set: {
        ownPaper: {
          $gt: [
            {
              $size: {
                $setIntersection: [
                  actorIds,
                  {
                    $setUnion: [
                      "$authors",
                      { $ifNull: ["$review.authorIds", []] },
                    ],
                  },
                ],
              },
            },
            0,
          ],
        },
      },
    },
    lookup(names.rounds, "review.currentRound", "_id", "rounds"),
    lookup(names.versions, "review.currentVersion", "_id", "versions"),
    {
      $lookup: {
        from: names.assignments,
        let: { round: "$review.currentRound", own: "$ownPaper" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$round", "$$round"] },
                  { $eq: ["$active", true] },
                  { $eq: ["$$own", false] },
                ],
              },
            },
          },
          { $sort: { slot: 1 } },
          {
            $lookup: {
              from: names.notifications,
              localField: "_id",
              foreignField: "assignmentId",
              pipeline: [
                { $sort: { _id: -1 } },
                { $limit: 1 },
                { $project: { state: 1 } },
              ],
              as: "messages",
            },
          },
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              round: { $toString: "$round" },
              reviewer: { $toString: "$reviewer" },
              name: 1,
              email: 1,
              slot: 1,
              deadline: 1,
              status: 1,
              active: 1,
              recommendation: 1,
              delivery: {
                $ifNull: [{ $first: "$messages.state" }, "NOT_SENT"],
              },
            },
          },
        ],
        as: "assignments",
      },
    },
    {
      $lookup: {
        from: names.revisions,
        localField: "_id",
        foreignField: "submission",
        pipeline: [
          { $match: { status: { $in: ["REQUESTED", "RECEIVED"] } } },
          { $sort: { _id: -1 } },
          { $limit: 1 },
          { $project: { status: 1 } },
        ],
        as: "corrections",
      },
    },
    {
      $set: {
        requiredReviews: {
          $ifNull: [{ $first: "$rounds.requiredReviews" }, required],
        },
        hasFile: {
          $or: [
            { $gt: [{ $size: "$versions" }, 0] },
            { $ne: [{ $ifNull: ["$fileUrl", ""] }, ""] },
          ],
        },
        correctionStatus: { $first: "$corrections.status" },
      },
    },
    {
      $set: {
        stage: {
          $switch: {
            branches: [
              { case: "$ownPaper", then: "OWN_PAPER" },
              {
                case: {
                  $ne: [
                    { $ifNull: ["$review.decision", "PENDING"] },
                    "PENDING",
                  ],
                },
                then: "$review.decision",
              },
              {
                case: { $in: ["$correctionStatus", ["REQUESTED", "RECEIVED"]] },
                then: "$correctionStatus",
              },
              { case: { $not: ["$hasFile"] }, then: "MISSING_FILE" },
              {
                case: {
                  $and: [
                    { $gte: [{ $size: "$assignments" }, "$requiredReviews"] },
                    {
                      $allElementsTrue: [
                        {
                          $map: {
                            input: "$assignments",
                            as: "a",
                            in: { $eq: ["$$a.status", "SUBMITTED"] },
                          },
                        },
                      ],
                    },
                  ],
                },
                then: "REVIEWS_COMPLETE",
              },
              {
                case: {
                  $anyElementTrue: [
                    {
                      $map: {
                        input: "$assignments",
                        as: "a",
                        in: {
                          $in: [
                            "$$a.status",
                            ["INVITED", "STARTED", "SUBMITTED"],
                          ],
                        },
                      },
                    },
                  ],
                },
                then: "IN_REVIEW",
              },
            ],
            default: {
              $cond: ["$review.formalApproved", "READY", "PREPARATION"],
            },
          },
        },
      },
    },
  ];
  if (filters.search?.trim()) {
    const regex = filters.search
      .trim()
      .slice(0, 200)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    stages.push({
      $match: {
        $or: [
          "translations.sk.name",
          "translations.en.name",
          "people.name",
        ].map((field) => ({ [field]: { $regex: regex, $options: "i" } })),
      },
    });
  }
  if (filters.stage) stages.push({ $match: { stage: filters.stage } });
  if (filters.reviewer)
    stages.push({ $match: { "assignments.reviewer": filters.reviewer } });
  if (filters.delivery)
    stages.push({ $match: { "assignments.delivery": filters.delivery } });
  stages.push({
    $facet: {
      count: [{ $count: "total" }],
      rows: [
        ...(after ? [{ $match: { _id: { $lt: after } } }] : []),
        { $sort: { _id: -1 } },
        { $limit: first + 1 },
        {
          $project: {
            _id: 0,
            submissionId: { $toString: "$_id" },
            title: {
              $ifNull: ["$translations.en.name", "$translations.sk.name"],
            },
            titleSk: "$translations.sk.name",
            sectionId: { $toString: "$section" },
            authors: {
              $map: {
                input: "$people",
                as: "p",
                in: { id: { $toString: "$$p._id" }, name: "$$p.name" },
              },
            },
            ownPaper: 1,
            hasFile: 1,
            stage: 1,
            assignments: 1,
            requiredReviews: { $cond: ["$ownPaper", 0, "$requiredReviews"] },
            correctionStatus: {
              $cond: ["$ownPaper", "$$REMOVE", "$correctionStatus"],
            },
            review: {
              $cond: [
                { $ne: [{ $ifNull: ["$review", null] }, null] },
                { decision: "$review.decision" },
                null,
              ],
            },
          },
        },
      ],
    },
  });
  return stages;
}
