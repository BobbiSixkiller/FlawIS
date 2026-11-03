import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "@/app/[lng]/internships/[internshipId]/application";
import { getIntern } from "@/app/[lng]/internships/[internshipId]/applications/[internId]/actions";
import CloseButton from "@/components/close-button";
import ModalTrigger from "@/components/modal-trigger";
import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import { translate } from "@/lib/i18n";
import ChangeStatusForm from "./change-status-form";
import { redirect } from "next/navigation";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import { deleteIntern } from "@/app/[lng]/internships/[internshipId]/actions";
import { changeInternStatus } from "./actions";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default async function InternPage({
  params,
}: {
  params: Promise<{ internshipId: string; internId: string; lng: string }>;
}) {
  const { internId, internshipId, lng } = await params;
  const intern = await getIntern(internId);
  if (!intern) {
    return redirect(`/internships/${internshipId}/applications`);
  }

  const { t } = await translate(lng, "internships");

  const deleteDialogId = "delete-intern";
  const statusDialogId = (status: Status) => "status-" + status;
  const canDelete = intern.status === Status.Rejected;

  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbLabel
        param="internId"
        value={internId}
        path={`/flawis/internships/${encodeURIComponent(internshipId)}/applications/${encodeURIComponent(internId)}`}
        label={intern.user.name}
      />
      <CloseButton href={`/internships/${internshipId}/applications`} />
      <Application
        lng={lng}
        application={intern}
        controls={
          <div className="flex gap-2">
            {canDelete ? (
              <ModalTrigger
                dialogId={deleteDialogId}
                size="icon"
                variant="destructive"
                aria-label={t("deleteIntern.title")}
              >
                <Icon name="trash" className="size-5" />
              </ModalTrigger>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="icon"
                      variant="destructive"
                      disabled
                      aria-label={t("deleteIntern.title")}
                    >
                      <Icon name="trash" className="size-5" />
                    </Button>
                  }
                />
                <TooltipContent side="top" className="max-w-xs text-pretty">
                  {t("deleteIntern.rejectFirst")}
                </TooltipContent>
              </Tooltip>
            )}

            <ModalTrigger
              dialogId={statusDialogId(Status.Eligible)}
              size="icon"
              variant="positive"
              disabled={intern.status === Status.Eligible}
            >
              <Icon name="check" className="size-5" />
            </ModalTrigger>

            <ModalTrigger
              dialogId={statusDialogId(Status.Rejected)}
              size="icon"
              variant="destructive"
              disabled={intern.status === Status.Rejected}
            >
              <Icon name="x-mark" className="size-5" />
            </ModalTrigger>
          </div>
        }
      />
      <Modal dialogId={deleteDialogId} title={t("deleteIntern.title")}>
        <ConfirmDeleteForm
          dialogId={deleteDialogId}
          text={t("deleteIntern.text")}
          action={async () => {
            "use server";
            return deleteIntern(intern.id);
          }}
        />
      </Modal>
      <Modal
        dialogId={statusDialogId(Status.Eligible)}
        title={t("statusChange.title")}
      >
        <ChangeStatusForm
          dialogId={statusDialogId(Status.Eligible)}
          status={Status.Eligible}
          action={async () => {
            "use server";
            return changeInternStatus({
              id: intern.id,
              status: Status.Eligible,
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
