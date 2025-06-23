import { translate } from "@/lib/i18n";
import { getMe } from "../(auth)/actions";
import { Access } from "@/lib/graphql/generated/graphql";
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

export default async function InternshipsHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams?: Promise<{ academicYear?: string }>;
}) {
  const { lng } = await params;
  const queryParams = await searchParams;

  const { startYear, endYear } = getAcademicYear();
  const academicYear = queryParams?.academicYear || `${startYear}/${endYear}`;

  const user = await getMe();

  // If user is an organization get all internships associated with the organization,
  // otherwise return internships for given academic year
  const filter =
    user.access.includes(Access.Organization) ||
    user.access.includes(Access.Admin)
      ? { user: user.id }
      : { academicYear, contextUserId: user.id };

  const initialData = await getInternships(filter);

  const addDialogId = "add-internship";

  const { t } = await translate(lng, ["internships", "common"]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            {t("heading")}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 text-sm">
            {t("subHeading")}
          </div>
        </div>
        {user.access.includes(Access.Organization) ||
        user.access.includes(Access.Admin) ? (
          <Tooltip message={t("tooltip.new")} position="below">
            <ModalTrigger dialogId={addDialogId}>
              <Button size="sm">
                <PlusIcon className="size-5 mr-2" />
                {t("create", { ns: "common" })}
              </Button>
            </ModalTrigger>
          </Tooltip>
        ) : (
          <AcademicYearSelect
            selectedYear={academicYear}
            years={initialData.academicYears.map((y) => y.academicYear)}
          />
        )}
      </div>

      <ListInternships initialData={initialData} filter={filter} />

      <Modal dialogId={addDialogId} title={t("new")}>
        <InternshipForm dialogId={addDialogId} />
      </Modal>
    </div>
  );
}
