import { redirect } from "next/navigation";
import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";
import CloseButton from "@/components/CloseButton";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import InternshipForm from "@/app/[lng]/internships/InternshipForm";
import DeleteInternshipForm from "@/app/[lng]/internships/[internshipId]/DeleteInternshipForm";
import { translate } from "@/lib/i18n";
import Spinner from "@/components/Spinner";

export default async function InternshipPage({
  params: { internshipId, lng },
}: {
  params: { internshipId: string; lng: string };
}) {
  const internship = await getInternship(internshipId);
  if (!internship) {
    redirect("/");
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
        <DeleteInternshipForm dialogId={deleteDialogId} />
      </Modal>
    </div>
  );
}
