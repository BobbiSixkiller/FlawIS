import NewSubmissionForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@attendee/(withTabs)/submissions/new/NewSubmissionForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";

export default async function NewSubmissionPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const { t } = await useTranslation(lng, "conferences");
  const conference = await getConference(slug);

  return (
    <Modal title={t("submission.new")}>
      <FormMessage lng={lng} />
      <NewSubmissionForm
        lng={lng}
        conferenceId={conference.id}
        sections={conference.sections}
      />
    </Modal>
  );
}
