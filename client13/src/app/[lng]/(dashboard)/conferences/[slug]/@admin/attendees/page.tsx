import { capitalizeFirstLetter } from "@/utils/helpers";
import ExportCSV from "./ExportCSV";
import ListAttendees from "./ListAttendees";
import { getAllAttendees, getAttendees } from "./actions";

export default async function AttendeesPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const [initialData, exportData] = await Promise.all([
    getAttendees({ conferenceSlug: slug }),
    getAllAttendees(slug),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <ExportCSV
        data={exportData.flatMap((attendee) => {
          if (attendee.submissions && attendee.submissions.length > 0) {
            return attendee.submissions.map((submission) => ({
              name: attendee.user.name,
              email: attendee.user.email,
              organization: attendee.user.organization,
              online: attendee.ticket.online.toString(),
              variableSymbol: attendee.invoice.issuer.variableSymbol,
              price: attendee.invoice.body.price + attendee.invoice.body.vat,
              section: submission.section.translations[lng as "sk" | "en"].name,
              submission_name_sk: capitalizeFirstLetter(
                submission.translations.sk.name
              ),
              submission_name_en: capitalizeFirstLetter(
                submission.translations.en.name
              ),
            }));
          } else {
            // If there are no submissions for the attendee, include them with empty submission data
            return [
              {
                name: attendee.user.name,
                email: attendee.user.email,
                organization: attendee.user.organization,
                online: attendee.ticket.online.toString(),
                variableSymbol: attendee.invoice.issuer.variableSymbol,
                price: attendee.invoice.body.price + attendee.invoice.body.vat,
                section: "",
                submission_name_sk: "",
                submission_name_en: "",
              },
            ];
          }
        })}
      />
      {initialData ? (
        <ListAttendees lng={lng} initialData={initialData} />
      ) : (
        "Ziadny"
      )}
    </div>
  );
}
