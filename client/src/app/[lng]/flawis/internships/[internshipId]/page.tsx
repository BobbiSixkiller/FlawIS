import { redirect } from "next/navigation";
import {
  deleteInternship,
  getInternship,
} from "@/app/[lng]/internships/[internshipId]/actions";
import BackButton from "@/components/back-button";
import ModalTrigger from "@/components/modal-trigger";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import InternshipForm from "@/app/[lng]/internships/internship-form";
import { translate } from "@/lib/i18n";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

export default async function InternshipPage({
  params,
}: {
  params: Promise<{ internshipId: string; lng: string }>;
}) {
  const { internshipId, lng } = await params;
  const internship = await getInternship(internshipId);
  if (!internship) {
    redirect("/internships");
  }

  const { t } = await translate(lng, "internships");

  const updateDialogId = "update-dialog";
  const deleteDialogId = "delete-internship";

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <ModalTrigger
          dialogId={updateDialogId}
          size="icon"
          className="rounded-full"
        >
          <Icon name="pencil" className="size-5" />
        </ModalTrigger>
        <ModalTrigger
          dialogId={deleteDialogId}
          variant="destructive"
          size="icon"
          className="rounded-full"
        >
          <Icon name="trash" className="size-5" />
        </ModalTrigger>

        <BackButton label={t("back")} />
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: internship.description }}
      />

      <Modal dialogId={updateDialogId} title={t("update")}>
        <InternshipForm dialogId={updateDialogId} data={internship} />
      </Modal>
      <Modal dialogId={deleteDialogId} title={t("delete.title")}>
        <ConfirmDeleteForm
          dialogId={deleteDialogId}
          text={`Naozaj si prajete zmazat tuto staz ?`}
          action={async () => {
            "use server";
            return deleteInternship(internship.id);
          }}
        />
      </Modal>
    </div>
  );
}
