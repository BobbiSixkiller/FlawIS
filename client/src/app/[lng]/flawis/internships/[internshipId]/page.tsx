import { redirect } from "next/navigation";
import {
  deleteInternship,
  getInternship,
} from "@/app/[lng]/internships/[internshipId]/actions";
import CloseButton from "@/components/CloseButton";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import InternshipForm from "@/app/[lng]/internships/InternshipForm";
import { translate } from "@/lib/i18n";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";

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
        <ModalTrigger dialogId={updateDialogId}>
          <Button size="icon" className="rounded-full">
            <PencilIcon className="size-5" />
          </Button>
        </ModalTrigger>
        <ModalTrigger dialogId={deleteDialogId}>
          <Button variant="destructive" size="icon" className="rounded-full">
            <TrashIcon className="size-5" />
          </Button>
        </ModalTrigger>

        <CloseButton href={`/internships`} />
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
