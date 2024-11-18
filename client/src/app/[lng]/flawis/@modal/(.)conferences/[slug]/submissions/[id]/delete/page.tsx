import DeleteSubmissionForm from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/[id]/delete/DeleteSubmissionForm";
import { getSubmission } from "@/app/[lng]/flawis/conferences/[slug]/register/actions";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function DeleteSubmissionPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const { t } = await useTranslation(lng, "conferences");
  const submission = await getSubmission(id);
  if (!submission) {
    redirect(`/conferences/${slug}/submissions`);
  }

  return (
    <Modal title={t("submission.delete")}>
      <DeleteSubmissionForm lng={lng} submission={submission} />
    </Modal>
  );
}
