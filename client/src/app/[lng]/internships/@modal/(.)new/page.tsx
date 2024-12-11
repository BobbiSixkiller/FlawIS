import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";
import InternshipForm from "../../new/InternshipForm";

export default async function NewInternshipModal({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "internships");

  return (
    <Modal title={t("new")}>
      <InternshipForm />
    </Modal>
  );
}
