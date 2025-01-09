import Modal from "@/components/Modal";
import DeleteInternshipForm from "../../../[internshipId]/delete/DeleteInternshipForm";

export default async function DeleteInternshipPage({
  params: { internshipId },
}: {
  params: { internshipId: string; lng: string };
}) {
  return (
    <Modal title="Delete internship">
      <DeleteInternshipForm id={internshipId} />
    </Modal>
  );
}
