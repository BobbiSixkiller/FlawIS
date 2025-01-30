import DeleteSubmissionForm from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/[id]/delete/DeleteSubmissionForm";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { redirect } from "next/navigation";
import { translate } from "@/lib/i18n";
import { getSubmission } from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/[id]/actions";

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
    <Modal
      title={t("submission.delete")}
      dialogId="delete-submission"
      isInterceptingRoute
    >
      <FormMessage />
      <DeleteSubmissionForm lng={lng} submission={submission} />
    </Modal>
  );
}
