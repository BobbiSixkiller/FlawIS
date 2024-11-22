import { getMe } from "@/app/[lng]/(auth)/actions";
import ConferenceRegistrationForm from "./ConferenceRegistrationForm";
import { redirect } from "next/navigation";
import { PresentationLng } from "@/lib/graphql/generated/graphql";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import { updateSubmission } from "../../(withTabs)/submissions/[id]/update/actions";
import { getSubmission } from "../../(withTabs)/submissions/[id]/actions";

export default async function RegisterPage({
  params: { lng, slug },
  searchParams,
}: {
  params: { slug: string; lng: string };
  searchParams: {
    submission?: string;
  };
}) {
  const user = await getMe();

  const [conference, submission] = await Promise.all([
    getConference(slug),
    getSubmission(searchParams.submission),
  ]);

  if (conference && conference.attending && !submission) {
    redirect(`/${slug}`);
  }

  if (
    conference &&
    conference.attending &&
    conference.attending.ticket.withSubmission &&
    submission
  ) {
    await updateSubmission(submission.id, {
      conference: submission.conference.id,
      authors: [],
      section: submission.section.id,
      translations: submission.translations,
      presentationLng:
        submission.presentationLng || (lng.toUpperCase() as PresentationLng),
    });

    redirect(`/${slug}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <ConferenceRegistrationForm
        lng={lng}
        conference={conference}
        submission={submission}
        billings={user!.billings}
      />
    </div>
  );
}
