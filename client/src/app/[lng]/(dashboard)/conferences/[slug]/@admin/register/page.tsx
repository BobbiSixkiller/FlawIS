import { getMe } from "@/app/[lng]/(auth)/actions";
import { getConference } from "../../../actions";
import ConferenceRegistrationForm from "./ConferenceRegistrationForm";
import { getSubmission, updateSubmission } from "./actions";
import { redirect } from "next/navigation";

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
    await updateSubmission(submission.id, {
      conference: submission.conference.id,
      authors: [],
      section: submission.section.id,
      translations: submission.translations,
    });
    redirect(`/conferences/${slug}`);
  }

  return (
    <div className="flex justify-center">
      <ConferenceRegistrationForm
        lng={lng}
        conference={conference}
        submission={submission}
        billings={user!.billings}
      />
    </div>
  );
}
