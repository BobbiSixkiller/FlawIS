import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "../../application";
import { translate } from "@/lib/i18n";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { getIntern } from "./actions";
import CloseButton from "@/components/close-button";
import ModalTrigger from "@/components/modal-trigger";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import ChangeStatusForm from "@/app/[lng]/flawis/internships/[internshipId]/applications/[internId]/change-status-form";
import CertificateForm from "./certificate-form";
import { redirect } from "next/navigation";
import { changeInternStatus } from "@/app/[lng]/flawis/internships/[internshipId]/applications/[internId]/actions";

export default async function InternPage({
  params,
}: {
  params: Promise<{ internshipId: string; internId: string; lng: string }>;
}) {
  const { internId, internshipId, lng } = await params;
  const { t } = await translate(lng, ["internships", "common"]);
  const intern = await getIntern(internId);
  if (!intern) {
    return redirect(`/${internshipId}/applications`);
  }

  const statusDialogId = (status: Status) => "status-" + status;
  const certificateDialogId = "create-certificate";

  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbLabel
        param="internId"
        value={internId}
        path={`/internships/${encodeURIComponent(internshipId)}/applications/${encodeURIComponent(internId)}`}
        label={intern.user.name}
      />
      <CloseButton href={`/${internshipId}/applications`} />
      <Application
        lng={lng}
        application={intern}
        controls={
          <div className="ml-auto flex gap-2">
            {intern.status === Status.Accepted && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <ModalTrigger dialogId={certificateDialogId} size="icon">
                      <Icon name="inbox-arrow-down" className="size-5" />
                    </ModalTrigger>
                  }
                />
                <TooltipContent side="top" className="max-w-xs text-pretty">
                  {t("internReview")}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger
                render={
                  <ModalTrigger
                    dialogId={statusDialogId(Status.Accepted)}
                    size="icon"
                    variant="positive"
                    disabled={intern.status === Status.Accepted}
                  >
                    <Icon name="check" className="size-5" />
                  </ModalTrigger>
                }
              />
              <TooltipContent side="top" className="max-w-xs text-pretty">
                {t("accept")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ModalTrigger
                    dialogId={statusDialogId(Status.Rejected)}
                    size="icon"
                    variant="destructive"
                    disabled={intern.status === Status.Rejected}
                  >
                    <Icon name="x-mark" className="size-5" />
                  </ModalTrigger>
                }
              />
              <TooltipContent side="top" className="max-w-xs text-pretty">
                {t("reject")}
              </TooltipContent>
            </Tooltip>
          </div>
        }
      />
      <Modal
        dialogId={certificateDialogId}
        title={t("upload", { ns: "common" })}
      >
        <CertificateForm dialogId={certificateDialogId} application={intern} />
      </Modal>
      <Modal
        dialogId={statusDialogId(Status.Accepted)}
        title={t("statusChange.title")}
      >
        <ChangeStatusForm
          dialogId={statusDialogId(Status.Accepted)}
          status={Status.Accepted}
          action={async () => {
            "use server";
            return changeInternStatus({
              id: intern.id,
              status: Status.Accepted,
            });
          }}
        />
      </Modal>
      <Modal
        dialogId={statusDialogId(Status.Rejected)}
        title={t("statusChange.title")}
      >
        <ChangeStatusForm
          dialogId={statusDialogId(Status.Rejected)}
          status={Status.Rejected}
          action={async () => {
            "use server";
            return changeInternStatus({
              id: intern.id,
              status: Status.Rejected,
            });
          }}
        />
      </Modal>
    </div>
  );
}
