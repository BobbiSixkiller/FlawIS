import { NextRequest, NextResponse } from "next/server";
import { createCSVResponse, getAcademicYear, toCSV } from "@/utils/helpers";
import { executeGqlFetch } from "@/utils/actions";
import { InternsExportDocument } from "@/lib/graphql/generated/graphql";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lng: string }> }
) {
  const res = await executeGqlFetch(InternsExportDocument);
  if (res.errors) {
    console.log(res.errors);

    return NextResponse.json(
      { message: res.errors[0].message },
      { status: 500 }
    );
  }

  const { academicYear } = getAcademicYear();

  return createCSVResponse(
    toCSV(
      res.data.internsExport.map((i) => ({
        name: i?.user.name,
        organization: i?.organization,
        status: i?.status,
        email: i?.user.email,
        phone: i?.user.telephone,
        class: i?.user.studyProgramme,
      }))
    ),
    `${academicYear}-interns.csv`
  );
}
