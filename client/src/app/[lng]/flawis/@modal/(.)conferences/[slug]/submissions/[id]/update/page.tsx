import UpdateSubmissionForm from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/[id]/update/UpdateSubmissionForm";
import { getSubmission } from "@/app/[lng]/flawis/conferences/[slug]/register/actions";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function UpdateSubmissionPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const { t } = await useTranslation(lng, "conferences");
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
