import { translate } from "@/lib/i18n";
import { getInternships } from "../../internships/actions";
import ListInternships from "../../internships/ListInternships";
import { getAcademicYear } from "@/utils/helpers";
import AcademicYearSelect from "../../internships/AcademicYearSelect";
import {
  InternshipSortableField,
  InternshipsQueryVariables,
  SortDirection,
} from "@/lib/graphql/generated/graphql";
import FilterDropdown from "@/components/FilterDropdown";
import ExportButton from "@/components/ExportButton";

export default async function InternshipsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams?: Promise<{ academicYear?: string; organization?: string[] }>;
}) {
  const { lng } = await params;
  const queryParams = await searchParams;
  const { t } = await translate(lng, "internships");

  const { academicYear } = getAcademicYear();

  const vars: InternshipsQueryVariables = {
    sort: [
      {
        field: InternshipSortableField.CreartedAt,
        direction: SortDirection.Desc,
      },
      {
        field: InternshipSortableField.Organization,
        direction: SortDirection.Asc,
      },
    ],

    filter: {
      academicYear: queryParams?.academicYear ?? academicYear, // Default to current academic year
      organizations: queryParams?.organization,
    },
  };

  const initialData = await getInternships(vars);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
            {t("heading")}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 text-sm">
            {t("subHeading")}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <FilterDropdown
            anchor={{ gap: 6, to: "bottom" }}
            filters={[
              {
                label: "Inštitúcie",
                type: "multi",
                queryKey: "organization",
                options: initialData.organizations.map((org) => ({
                  label: `${org.organization} - ${org.count}`,
                  value: org.organization,
                })),
              },
            ]}
          />
          <AcademicYearSelect
            selectedYear={queryParams?.academicYear ?? academicYear}
            years={initialData.academicYears.map((y) => y.academicYear)}
          />
          <ExportButton fetchUrl="/export?type=interns" />
        </div>
      </div>

      {initialData && <ListInternships initialData={initialData} vars={vars} />}
    </div>
  );
}
