import NewSubmissionForm from "@/app/[lng]/conferences/[slug]/(withTabs)/submissions/new/NewSubmissionForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";

export default async function NewSubmissionPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const { t } = await translate(lng, "conferences");
  const conference = await getConference(slug);

  return (
    <Modal
      title={t("submission.new")}
      dialogId="new-submission"
      isInterceptingRoute
    >
      <NewSubmissionForm
        lng={lng}
        conferenceId={conference.id}
        sections={conference.sections}
      />
    </Modal>
  );
}
