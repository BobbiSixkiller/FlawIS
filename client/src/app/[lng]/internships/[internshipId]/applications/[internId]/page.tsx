import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "../../Application";
import { translate } from "@/lib/i18n";
import Tooltip from "@/components/Tooltip";
import { getIntern } from "./actions";
import CloseButton from "@/components/CloseButton";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import {
  CheckIcon,
  InboxArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import ChangeStatusForm from "@/app/[lng]/flawis/internships/[internshipId]/applications/[internId]/ChangeStatusForm";
import CertificateForm from "./CertificateForm";
import { redirect } from "next/navigation";

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
      <CloseButton href={`/${internshipId}/applications`} />
      <Application
        lng={lng}
        application={intern}
        controls={
          <div className="ml-auto flex gap-2">
            {intern.status === Status.Accepted && (
              <Tooltip message={t("internReview")}>
                <ModalTrigger dialogId={certificateDialogId}>
                  <Button size="icon">
                    <InboxArrowDownIcon className="size-5" />
                  </Button>
                </ModalTrigger>
              </Tooltip>
            )}

            <Tooltip message={t("accept")}>
              <ModalTrigger dialogId={statusDialogId(Status.Accepted)}>
                <Button
                  size="icon"
                  variant="positive"
                  disabled={intern.status === Status.Accepted}
                >
                  <CheckIcon className="size-5" />
                </Button>
              </ModalTrigger>
            </Tooltip>

            <Tooltip message={t("reject")}>
              <ModalTrigger dialogId={statusDialogId(Status.Rejected)}>
                <Button
                  size="icon"
                  variant="destructive"
                  disabled={intern.status === Status.Rejected}
                >
                  <XMarkIcon className="size-5" />
                </Button>
              </ModalTrigger>
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
