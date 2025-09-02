import { translate } from "@/lib/i18n";
import { getMe } from "../(auth)/actions";
import {
  Access,
  InternshipSortableField,
  InternshipsQueryVariables,
  SortDirection,
} from "@/lib/graphql/generated/graphql";
import ListInternships from "./ListInternships";
import { getAcademicYear } from "@/utils/helpers";
import { getInternships } from "./actions";
import AcademicYearSelect from "./AcademicYearSelect";
import Tooltip from "@/components/Tooltip";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import InternshipForm from "./InternshipForm";
import FilterDropdown from "@/components/FilterDropdown";

export default async function InternshipsHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams?: Promise<{ academicYear?: string; organization?: string[] }>;
}) {
  const { lng } = await params;
  const queryParams = await searchParams;

  const user = await getMe();
  const { academicYear } = getAcademicYear();

  const vars: InternshipsQueryVariables = {
    sort: [
      {
        field: InternshipSortableField.CreartedAt,
        direction: SortDirection.Asc,
      },
      {
        field: InternshipSortableField.HasApplication,
        direction: SortDirection.Desc,
      },
    ],

    // If user is an organization get all internships associated with the organization,
    // otherwise return all internships for given academic year
    filter: {
      user: user.access.includes(Access.Organization) ? user.id : undefined,
      academicYear: queryParams?.academicYear ?? academicYear,
      organizations: queryParams?.organization,
    },
  };

  const initialData = await getInternships(vars);

  const addDialogId = "add-internship";

  const { t } = await translate(lng, ["internships", "common"]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6 justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white/85 sm:truncate sm:text-3xl sm:tracking-tight">
            {t("heading")}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 text-sm">
            {t("subHeading")}
          </div>
        </div>

        <div className="flex gap-2">
          <FilterDropdown
            anchor="bottom"
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
          {(user.access.includes(Access.Organization) ||
            user.access.includes(Access.Admin)) && (
            <Tooltip message={t("tooltip.new")} position="below">
              <ModalTrigger dialogId={addDialogId}>
                <Button size="sm">
                  <PlusIcon className="size-5 mr-2" />
                  {t("create", { ns: "common" })}
                </Button>
              </ModalTrigger>
            </Tooltip>
          )}
        </div>
      </div>

      <ListInternships initialData={initialData} vars={vars} />

      <Modal dialogId={addDialogId} title={t("new")}>
        <InternshipForm
          dialogId={addDialogId}
          organization={user.organization ?? "Organizácia"}
        />
      </Modal>
    </div>
  );
}
