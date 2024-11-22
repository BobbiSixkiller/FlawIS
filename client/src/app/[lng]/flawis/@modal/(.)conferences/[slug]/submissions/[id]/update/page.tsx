import UpdateSubmissionForm from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/[id]/update/UpdateSubmissionForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";
import { redirect } from "next/navigation";
import { translate } from "@/lib/i18n";
import { getSubmission } from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/[id]/actions";

export default async function UpdateSubmissionPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const { t } = await translate(lng, "conferences");
  const [conference, submission] = await Promise.all([
    getConference(slug),
    getSubmission(id),
  ]);
  if (!submission) {
    redirect(`/conferences/${slug}/submissions`);
  }

  return (
    <Modal title={t("submission.update")}>
      <UpdateSubmissionForm
        lng={lng}
        submission={submission}
        sections={conference.sections}
      />
    </Modal>
  );
}
