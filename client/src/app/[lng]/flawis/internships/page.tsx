import { translate } from "@/lib/i18n";
import { getInternships } from "../../internships/actions";
import ListInternships from "../../internships/ListInternships";
import { getAcademicYear } from "@/utils/helpers";
import AcademicYearSelect from "../../internships/AcademicYearSelect";

export default async function InternshipsPage({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams?: { academicYear?: string };
}) {
  const { t } = await translate(lng, "internships");

  const { startYear, endYear } = getAcademicYear();
  const academicYear = searchParams?.academicYear || `${startYear}/${endYear}`;

  const initialData = await getInternships({ academicYear });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {t("heading")}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 text-sm">
            {t("subHeading")}
          </div>
        </div>

        <AcademicYearSelect
          selectedYear={academicYear}
          years={initialData.academicYears.map((y) => y.academicYear)}
        />
      </div>

      {initialData && (
        <ListInternships initialData={initialData} filter={{ academicYear }} />
      )}
    </div>
  );
}
