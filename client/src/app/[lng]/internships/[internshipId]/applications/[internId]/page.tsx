import ChangeStatusDialog from "@/app/[lng]/flawis/internships/[internshipId]/applications/[internId]/ChangeStatusDialog";
import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "../../Application";
import { translate } from "@/lib/i18n";
import Tooltip from "@/components/Tooltip";
import InternCertificateDialog from "./InternCertificateDialog";
import { getIntern } from "./actions";
import CloseButton from "@/components/CloseButton";

export default async function InternPage({
  params: { internshipId, internId, lng },
}: {
  params: { internshipId: string; internId: string; lng: string };
}) {
  const { t } = await translate(lng, "internships");
  const intern = await getIntern(internId);

  return (
    <div className="flex flex-col gap-6">
      <CloseButton href={`/${internshipId}/applications`} />

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
