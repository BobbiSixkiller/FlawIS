import { capitalizeFirstLetter } from "@/utils/helpers";
import { getAllAttendees } from "../flawis/conferences/[slug]/attendees/actions";
import { getCourseAttendance } from "../flawis/courses/[id]/attendance/actions";
import { executeGqlFetch } from "@/utils/actions";
import { InternsExportDocument } from "@/lib/graphql/generated/graphql";

type ExportParams = Record<string, string | undefined>;
type ExportFetcher = (params: ExportParams) => Promise<Record<string, any>[]>;

//refactor this so it uses streams based on grahpql cursor based paginated query so it is scallable
//then ditch those export queries already implemented and use only the paginated queries
//export button will probably also need to be refactored

export const csvExportRegistry: Record<string, ExportFetcher> = {
  attendees: async ({ lng, slug }) => {
    if (!lng || !slug) throw new Error("lng and slug are required");
    const data = await getAllAttendees(slug);

    return data.flatMap((attendee) => {
      const base = {
        name: attendee.user.name,
        email: attendee.user.email,
        organization:
          attendee.user.__typename === "User"
            ? attendee.user.organization
            : "missing User doc",
        ticket: attendee.ticket.translations.sk.name,
        online: String(attendee.ticket.online),
        variableSymbol: attendee.invoice.issuer.variableSymbol,
        price: attendee.invoice.body.price + attendee.invoice.body.vat,
      };

      if (attendee.submissions?.length) {
        return attendee.submissions.map((submission) => ({
          ...base,
          section: submission.section.translations[lng as "sk" | "en"].name,
          submission_name_sk: capitalizeFirstLetter(
            submission.translations.sk.name
          ),
          submission_name_en: capitalizeFirstLetter(
            submission.translations.en.name
          ),
          abstract_sk: submission.translations.sk.abstract,
          abstract_en: submission.translations.en.abstract,
          language: submission.presentationLng || "",
          file: submission.fileUrl ? "true" : "false",
        }));
      }

      return [
        {
          ...base,
          section: "",
          submission_name_sk: "",
          submission_name_en: "",
          abstract_sk: "",
          abstract_en: "",
          language: "",
          file: "false",
        },
      ];
    });
  },
  courseAttendees: async ({ id }) => {
    if (!id) throw new Error("id is required");

    const allAttendances: any[] = [];
    let sessions: any[] = [];
    let after: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const page = await getCourseAttendance({ id, sort: [], after });

      if (!sessions.length) sessions = page.sessions;

      for (const edge of page.edges || []) {
        if (edge?.node) allAttendances.push(edge.node);
      }

      hasNextPage = page.pageInfo.hasNextPage;
      after = page.pageInfo.endCursor ?? null;
    }

    return allAttendances.map((a) => {
      const row: Record<string, string> = {
        name: a.attendee.user.name,
        status: a.attendee.status,
      };

      sessions.forEach((session, i) => {
        const key = new Date(session.start).toISOString().slice(0, 10);
        const record = a.attendanceRecords[i];
        row[`${key}_online`] = record ? String(record.online ?? false) : "";
        row[`${key}_hours`] = record ? String(record.hoursAttended) : "";
      });

      return row;
    });
  },
  interns: async () => {
    const res = await executeGqlFetch(InternsExportDocument);

    return res.data.internsExport.map((i) => ({
      name: i?.user.name,
      organization: i?.organization,
      status: i?.status,
      email: i?.user.email,
      phone: i?.user.telephone,
      class: i?.user.studyProgramme,
      semester: i?.semester,
    }));
  },
};
