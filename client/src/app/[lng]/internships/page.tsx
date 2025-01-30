import { translate } from "@/lib/i18n";
import { getMe } from "../(auth)/actions";
import { Access } from "@/lib/graphql/generated/graphql";
import ListInternships from "./ListInternships";
import { getAcademicYear } from "@/utils/helpers";
import { getInternships } from "./actions";
import InternshipDialog from "./InternshipDialog";
import AcademicYearSelect from "./AcademicYearSelect";

export default async function InternshipsHomePage({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams?: { academicYear?: string };
}) {
  const user = await getMe();

  const { t } = await translate(lng, "internships");

  const { startYear, endYear } = getAcademicYear();
  const academicYear = searchParams?.academicYear || `${startYear}/${endYear}`;

  // If user is an organization get all internships associated with the organization,
  // otherwise return internships for given academic year
  const filter =
    user.access.includes(Access.Organization) ||
    user.access.includes(Access.Admin)
      ? { user: user.id }
      : { academicYear, contextUserId: user.id };

  const initialData = await getInternships(filter);

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
        {user.access.includes(Access.Organization) ||
        user.access.includes(Access.Admin) ? (
          <InternshipDialog />
        ) : (
          <AcademicYearSelect
            selectedYear={academicYear}
            years={initialData.academicYears.map((y) => y.academicYear)}
          />
        )}
      </div>

      <ListInternships initialData={initialData} filter={filter} />
    </div>
  );
}
