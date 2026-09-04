import { translate } from "@/lib/i18n";
import {
  InternshipSortableField,
  InternshipsQueryVariables,
  SortDirection,
} from "@/lib/graphql/generated/graphql";
import ListInternships from "./ListInternships";
import { getAcademicYear } from "@/lib/clientUtils";
import { getInternships } from "./actions";
import AcademicYearSelect from "./AcademicYearSelect";
import Tooltip from "@/components/Tooltip";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import InternshipForm from "./InternshipForm";
import FilterDropdown from "@/components/FilterDropdown";
import { getOptionalViewer } from "@/lib/optionalViewer";
import {
  getInternshipAccess,
  normalizeQueryValues,
} from "@/lib/internshipAccess";

export default async function InternshipsHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams?: Promise<{
    academicYear?: string;
    organization?: string | string[];
  }>;
}) {
  const [{ lng }, queryParams, user] = await Promise.all([
    params,
    searchParams,
    getOptionalViewer(),
  ]);
  const { academicYear } = getAcademicYear();
  const access = getInternshipAccess(user);

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

    filter: {
      academicYear: queryParams?.academicYear ?? academicYear,
      organizations: normalizeQueryValues(queryParams?.organization),
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
            anchor={{ gap: 6, to: "bottom" }}
            filters={[
              {
                label: t("filters.organizations"),
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
          {access.canCreate && (
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

      <ListInternships initialData={initialData} vars={vars} hrefBase="" />

      {access.canCreate && user ? (
        <Modal dialogId={addDialogId} title={t("new")}>
          <InternshipForm
            dialogId={addDialogId}
            organization={user.organization}
          />
        </Modal>
      ) : null}
    </div>
  );
}
