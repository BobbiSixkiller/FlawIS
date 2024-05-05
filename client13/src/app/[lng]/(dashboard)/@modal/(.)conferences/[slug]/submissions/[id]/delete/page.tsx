import DeleteSubmissionForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@attendee/(withTabs)/submissions/[id]/delete/DeleteSubmissionForm";
import UpdateSubmissionForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@attendee/(withTabs)/submissions/[id]/update/UpdateSubmissionForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function DeleteSubmissionPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const { t } = await useTranslation(lng, "conferences");
  const conference = await getConference(slug);
  const submission = conference.attending?.submissions.find((s) => s.id === id);
  if (!submission) {
    redirect(`/conferences/${slug}/submissions`);
  }

  return (
    <Modal title={t("submission.delete")}>
      <FormMessage lng={lng} />
      <DeleteSubmissionForm lng={lng} submission={submission} />
    </Modal>
  );
}
