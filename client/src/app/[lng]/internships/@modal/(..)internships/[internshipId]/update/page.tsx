import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";
import InternshipForm from "@/app/[lng]/internships/new/InternshipForm";
import Modal from "@/components/Modal";

export default async function UpdateInternship({
  params: { internshipId },
}: {
  params: { lng: string; internshipId: string };
}) {
  const internship = await getInternship(internshipId);

  return (
    <Modal title="Update">
      <InternshipForm data={internship} />
    </Modal>
  );
}
