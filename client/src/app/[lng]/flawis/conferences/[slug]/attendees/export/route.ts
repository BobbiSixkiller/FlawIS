import { stringify } from "csv-stringify";
import { NextRequest } from "next/server";
import { getAllAttendees } from "../actions";
import { capitalizeFirstLetter } from "@/utils/helpers";

export async function GET(
  req: NextRequest,
  { params: { lng, slug } }: { params: { lng: string; slug: string } }
) {
  await new Promise((res) => setTimeout(() => res("success"), 4000));
  const data = await getAllAttendees(slug);

  const exportData = data.flatMap((attendee) => {
    if (attendee.submissions && attendee.submissions.length > 0) {
      return attendee.submissions.map((submission) => ({
        name: attendee.user.name,
        email: attendee.user.email,
        organization:
          attendee.user.__typename === "User"
            ? attendee.user.organization
            : "missing User doc",
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
        abstract_sk: submission.translations.sk.abstract,
        abstract_en: submission.translations.en.abstract,
        language: submission.presentationLng || "",
        file: submission.fileUrl ? "true" : "false",
      }));
    } else {
      // If there are no submissions for the attendee, include them with empty submission data
      return [
        {
          name: attendee.user.name,
          email: attendee.user.email,
          organization:
            attendee.user.__typename === "User"
              ? attendee.user.organization
              : "",
          online: attendee.ticket.online.toString(),
          variableSymbol: attendee.invoice.issuer.variableSymbol,
          price: attendee.invoice.body.price + attendee.invoice.body.vat,
          section: "",
          submission_name_sk: "",
          submission_name_en: "",
          abstract_sk: "",
          abstract_en: "",
          language: "",
          file: "false",
        },
      ];
    }
  });

  const csvString = await convertToCSV(exportData);

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${slug}-export.csv"`,
      "Content-Type": "text/csv",
    },
  });
}

function convertToCSV(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true }, (err, output) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
}
