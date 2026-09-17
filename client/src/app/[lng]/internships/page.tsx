import { translate } from "@/lib/i18n";
import {
  InternshipSortableField,
  InternshipsQueryVariables,
  SortDirection,
} from "@/lib/graphql/generated/graphql";
import ListInternships from "./ListInternships";
import { getAcademicYear } from "@/lib/utilsClient";
import { getInternships } from "./actions";
import AcademicYearSelect from "./AcademicYearSelect";
import Tooltip from "@/components/Tooltip";
import ModalTrigger from "@/components/ModalTrigger";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import InternshipForm from "./InternshipForm";
import UrlFilter from "@/components/UrlFilter";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white/85 sm:truncate sm:text-3xl sm:tracking-tight">
            {t("heading")}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 text-sm">
            {t("subHeading")}
          </div>
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 md:w-auto md:shrink-0 md:justify-end">
          <UrlFilter
            lng={lng}
            anchor={{ gap: 6, padding: 16, to: "bottom end" }}
            wrapperClassName="order-3 ml-auto md:order-1 md:ml-0"
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
          <div className="order-1 shrink-0 md:order-2">
            <AcademicYearSelect
              selectedYear={queryParams?.academicYear ?? academicYear}
              years={initialData.academicYears.map((y) => y.academicYear)}
            />
          </div>
          {access.canCreate && (
            <div className="order-2 shrink-0 md:order-3">
              <Tooltip message={t("tooltip.new")} position="below">
                <ModalTrigger dialogId={addDialogId} size="sm">
                  <Icon name="plus" className="size-5 sm:mr-2" />
                  <span className="sr-only sm:not-sr-only">
                    {t("create", { ns: "common" })}
                  </span>
                </ModalTrigger>
              </Tooltip>
            </div>
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
