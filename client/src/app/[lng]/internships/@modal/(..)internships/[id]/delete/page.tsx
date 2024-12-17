import Modal from "@/components/Modal";
import DeleteInternshipForm from "../../../../[id]/delete/DeleteInternshipForm";

export default async function DeleteInternshipPage({
  params: { id },
}: {
  params: { id: string; lng: string };
}) {
  return (
    <Modal title="Delete internship">
      <DeleteInternshipForm id={id} />
    </Modal>
  );
}
