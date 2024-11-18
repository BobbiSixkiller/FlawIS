import Heading from "@/components/Heading";

import { getMe } from "@/app/[lng]/(auth)/actions";
import { redirect } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import { getSubmission } from "../../(withTabs)/submissions/[id]/actions";
import { updateSubmission } from "../../(withTabs)/submissions/[id]/update/actions";
import ConferenceRegistrationForm from "@/app/[lng]/flawis/conferences/[slug]/register/ConferenceRegistrationForm";

export default async function RegisterPage({
  params: { lng, slug },
  searchParams,
}: {
  params: { slug: string; lng: string };
  searchParams?: {
    submission?: string;
  };
}) {
  const user = await getMe();

  const [conference, submission] = await Promise.all([
    getConference(slug),
    getSubmission(searchParams?.submission),
  ]);

  if (conference && conference.attending && !submission) {
    redirect(`/conferences/${slug}`);
  }
  if (
    conference &&
    conference.attending &&
    submission &&
    conference.attending.ticket.withSubmission
  ) {
    const res = await updateSubmission(submission.id, {
      conference: submission.conference.id,
      authors: [],
      section: submission.section.id,
      translations: submission.translations,
    });
    console.log(res);
    redirect(`/conferences/${slug}`);
  }

  const { t } = await useTranslation(lng, "conferences");

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading={t("registration.heading")}
        subHeading={conference!.translations[lng as "sk" | "en"].name}
      />
      <ConferenceRegistrationForm
        lng={lng}
        conference={conference}
        submission={submission}
        billings={user!.billings}
      />
    </div>
  );
}
