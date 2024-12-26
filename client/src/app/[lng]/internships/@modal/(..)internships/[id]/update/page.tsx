import { getInternship } from "@/app/[lng]/internships/[id]/actions";
import InternshipForm from "@/app/[lng]/internships/new/InternshipForm";
import Modal from "@/components/Modal";

export default async function UpdateInternship({
  params: { id },
}: {
  params: { lng: string; id: string };
}) {
  const internship = await getInternship(id);

  return (
    <Modal title="Update">
      <InternshipForm data={internship} />
    </Modal>
  );
}
