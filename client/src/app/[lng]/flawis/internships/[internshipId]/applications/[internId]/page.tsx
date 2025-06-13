import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "@/app/[lng]/internships/[internshipId]/Application";
import { getIntern } from "@/app/[lng]/internships/[internshipId]/applications/[internId]/actions";
import CloseButton from "@/components/CloseButton";
import ModalTrigger from "@/components/ModalTrigger";
import { CheckIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import DeleteApplicationForm from "@/app/[lng]/internships/[internshipId]/DeleteApplicationForm";
import { translate } from "@/lib/i18n";
import ChangeStatusForm from "./ChangeStatusForm";
import { redirect } from "next/navigation";

export default async function InternPage({
  params: { internshipId, internId, lng },
}: {
  params: { internshipId: string; internId: string; lng: string };
}) {
  const intern = await getIntern(internId);
  if (!intern) {
    return redirect(`/internships/${internshipId}/applications`);
  }

  const { t } = await translate(lng, "internships");

  const deleteDialogId = "delete-intern";
  const statusDialogId = (status: Status) => "status-" + status;

  return (
    <div className="flex flex-col gap-6">
      <CloseButton href={`/internships/${internshipId}/applications`} />
      <Application
        lng={lng}
        application={intern}
        controls={
          <div className="flex gap-2">
            <ModalTrigger dialogId={deleteDialogId}>
              <Button size="icon" variant="destructive">
                <TrashIcon className="size-5" />
              </Button>
            </ModalTrigger>

            <ModalTrigger dialogId={statusDialogId(Status.Eligible)}>
              <Button
                size="icon"
                variant="positive"
                disabled={intern.status === Status.Eligible}
              >
                <CheckIcon className="size-5" />
              </Button>
            </ModalTrigger>

            <ModalTrigger dialogId={statusDialogId(Status.Rejected)}>
              <Button
                size="icon"
                variant="destructive"
                disabled={intern.status === Status.Rejected}
              >
                <XMarkIcon className="size-5" />
              </Button>
            </ModalTrigger>
          </div>
        }
      />
      <Modal dialogId={deleteDialogId} title={t("deleteIntern.title")}>
        <DeleteApplicationForm dialogId={deleteDialogId} internId={intern.id} />
      </Modal>
      <Modal
        dialogId={statusDialogId(Status.Eligible)}
        title={t("statusChange.title")}
      >
        <ChangeStatusForm
          dialogId={statusDialogId(Status.Eligible)}
          status={Status.Eligible}
        />
      </Modal>
      <Modal
        dialogId={statusDialogId(Status.Rejected)}
        title={t("statusChange.title")}
      >
        <ChangeStatusForm
          dialogId={statusDialogId(Status.Rejected)}
          status={Status.Rejected}
        />
      </Modal>
    </div>
  );
}
