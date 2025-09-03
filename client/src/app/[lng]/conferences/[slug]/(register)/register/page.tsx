import { getMe } from "@/app/[lng]/(auth)/actions";
import ConferenceRegistrationForm from "./ConferenceRegistrationForm";
import { redirect } from "next/navigation";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import { getSubmission } from "../../(withTabs)/submissions/actions";
import { acceptAuthorInvite } from "./actions";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lng: string }>;
  searchParams: Promise<{
    submission?: string;
    token?: string;
  }>;
}) {
  const { lng, slug } = await params;
  const { submission: submissionId, token } = await searchParams;

  const [conference, submission, user] = await Promise.all([
    getConference(slug),
    getSubmission(submissionId),
    getMe(),
  ]);

  if (conference?.attending && !submission) {
    redirect(`/${slug}`);
  }

  if (conference?.attending?.ticket.withSubmission && submission && token) {
    const { success, message } = await acceptAuthorInvite(token);
    if (!success) {
      throw new Error(message);
    } else {
      redirect(`/${slug}/submissions`);
    }
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
