import { stringify } from "csv-stringify";
import { NextRequest, NextResponse } from "next/server";
import { getAllAttendees } from "../actions";
import { capitalizeFirstLetter } from "@/utils/helpers";

export async function GET(
  req: NextRequest,
  { params: { lng, slug } }: { params: { lng: string; slug: string } }
) {
  const data = await getAllAttendees(slug);
  console.log(data);
  const exportData = data.flatMap((attendee) => {
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
  });

  console.log(exportData);

  const csvString = await convertToCSV(exportData);

  console.log(csvString);

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
