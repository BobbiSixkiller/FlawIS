import { MiddlewareFn } from "type-graphql";
import Container from "typedi";
import { ObjectId } from "mongodb";
import { Context } from "../util/auth";
import { requestContext } from "../util/requestContext";
import { withOptionalTransaction } from "../util/helpers";
import { ActivityService } from "../services/reviews/activity.service";
import { Repository } from "../repositories/base.repository";
import { Conference } from "../entitites/Conference";

const mutations = new Set([
  "createConference",
  "deleteConference",
  "updateConferenceDates",
  "createTicket",
  "updateTicket",
  "deleteTicket",
  "createSection",
  "updateSection",
  "deleteSection",
  "addAttendee",
  "deleteAttendee",
  "updateInvoice",
  "createSubmission",
  "updateSubmission",
  "deleteSubmission",
  "removeAuthor",
  "acceptAuthorInvite",
  "createLibraryForm",
  "publishLibraryForm",
  "archiveLibraryForm",
]);
const transactional = new Set([
  "register",
  ...mutations,
  "setReviewCoordinator",
  "revokeReviewCoordinator",
  "setReviewerEligibility",
  "bindCourseRegistrationForm",
]);
const reads = new Set([
  "conference",
  "conferences",
  "attendee",
  "attendees",
  "submission",
  "submissions",
]);
const oid = (v: any) =>
  v && ObjectId.isValid(String(v)) ? new ObjectId(String(v)) : undefined;
export const ActivityMiddleware: MiddlewareFn<Context> = async (
  { context, info, args },
  next,
) => {
  const root = !info.path.prev;
  const store = requestContext.getStore() || {
    requestId: context.requestId,
    events: new Set<string>(),
  };
  const execute = async () => {
    const result = await next();
    if (
      !context.user ||
      (!reads.has(info.fieldName) && !mutations.has(info.fieldName))
    )
      return result;
    try {
      const data = result?.data || result;
      let conference = oid(
        data?.conference?.id ||
          data?.conference?._id ||
          data?.conference ||
          args.data?.conference ||
          args.conference,
      );
      if (
        [
          "createConference",
          "deleteConference",
          "updateConferenceDates",
          "createTicket",
          "updateTicket",
          "deleteTicket",
          "conference",
        ].includes(info.fieldName)
      )
        conference = oid(data?.id || data?._id);
      if (!conference && args.slug)
        conference = oid(
          (await new Repository(Conference).findOne({ slug: args.slug }))?._id,
        );
      const submission =
        /Submission|Author/.test(info.fieldName) ||
        info.fieldName === "submission"
          ? oid(data?.id || data?._id || args.id)
          : undefined;
      const activity = Container.get(ActivityService);
      if (info.operation.operation === "mutation")
        await activity.record(
          context.user,
          `conference.${info.fieldName}`,
          conference,
          submission,
          {
            fields: Object.keys(args.data || {}).filter(
              (k) => !["token", "password"].includes(k),
            ),
          },
          requestContext.getStore()?.session,
        );
      else {
        await activity.read(
          context.user,
          `conference.${info.fieldName}.accessed`,
          conference,
          submission,
        );
        if (info.fieldName === "submissions") {
          const papers = Array.isArray(data)
            ? data
            : data?.edges?.map((edge: any) => edge.node) || [];
          for (const paper of papers)
            await activity.read(
              context.user,
              "submission.listed",
              oid(
                paper.conference?.id ||
                  paper.conference?._id ||
                  paper.conference,
              ) || conference,
              oid(paper.id || paper._id),
            );
        }
      }
    } catch (error) {
      if (info.operation.operation === "mutation") throw error;
      console.error(
        JSON.stringify({
          event: "activity.read_write_failed",
          action: info.fieldName,
        }),
      );
    }
    return result;
  };
  if (
    root &&
    info.operation.operation === "mutation" &&
    transactional.has(info.fieldName)
  )
    return withOptionalTransaction(undefined, (session) =>
      requestContext.run({ ...store, session }, execute),
    );
  return requestContext.run(store, execute);
};
