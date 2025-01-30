import Button from "@/components/Button";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ChangeStatusDialog from "@/app/[lng]/flawis/internships/[internshipId]/applications/[internId]/ChangeStatusDialog";
import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "../../Application";
import { translate } from "@/lib/i18n";
import Tooltip from "@/components/Tooltip";
import InternCertificateDialog from "./InternCertificateDialog";
import { getIntern } from "./actions";

export default async function InternPage({
  params: { internshipId, internId, lng },
}: {
  params: { internshipId: string; internId: string; lng: string };
}) {
  const { t } = await translate(lng, "internships");
  const intern = await getIntern(internId);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        as={Link}
        className="rounded-full h-full p-2 hover:bg-gray-100 hover:text-gray-400 ml-auto"
        href={`/${internshipId}/applications`}
      >
        <XMarkIcon className="size-5" />
      </Button>
      <Application
        lng={lng}
        application={intern}
        controls={
          <div className="ml-auto flex gap-2">
            {intern.status === Status.Accepted && (
              <Tooltip message={t("internReview")}>
                <InternCertificateDialog application={intern} />
              </Tooltip>
            )}

            <Tooltip message={t("accept")}>
              <ChangeStatusDialog
                status={Status.Accepted}
                disabled={intern.status === Status.Accepted}
              />
            </Tooltip>

            <Tooltip message={t("reject")}>
              <ChangeStatusDialog
                status={Status.Rejected}
                disabled={intern.status === Status.Rejected}
              />
            </Tooltip>
          </div>
        }
      />
    </div>
  );
}
