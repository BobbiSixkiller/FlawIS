import DeleteSubmissionForm from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/[id]/delete/DeleteSubmissionForm";
import { getSubmission } from "@/app/[lng]/conferences/[slug]/(register)/register/actions";
import Modal from "@/components/Modal";
import { redirect } from "next/navigation";
import { translate } from "@/lib/i18n";

export default async function DeleteSubmissionPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const { t } = await translate(lng, "conferences");
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
