import { getMe } from "@/app/[lng]/(auth)/actions";
import ConferenceRegistrationForm from "./ConferenceRegistrationForm";
import { redirect } from "next/navigation";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import { getSubmission } from "../../(withTabs)/submissions/actions";
import { acceptAuthorInvite } from "./actions";

export default async function RegisterPage({
  params: { lng, slug },
  searchParams,
}: {
  params: { slug: string; lng: string };
  searchParams: {
    submission?: string;
    token?: string;
  };
}) {
  const [conference, submission, user] = await Promise.all([
    getConference(slug),
    getSubmission(searchParams.submission),
    getMe(),
  ]);

  if (conference?.attending && !submission) {
    redirect(`/${slug}`);
  }

  if (
    conference?.attending?.ticket.withSubmission &&
    submission &&
    searchParams.token
  ) {
    await acceptAuthorInvite(searchParams.token);

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
