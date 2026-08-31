import { getMe } from "@/app/[lng]/(auth)/actions";
import ConferenceRegistrationForm from "./ConferenceRegistrationForm";
import { redirect } from "next/navigation";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import {
  conferenceInvitationHref,
  conferenceWorkspaceHref,
} from "@/lib/conferenceRegistration";
import { getSubmissionInvite } from "../actions";
import { acceptAuthorInvite } from "./actions";
import InvitationError from "./InvitationError";

export default async function ConferenceRegisterPage({
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

  const [conference, invitation, user] = await Promise.all([
    getConference(slug),
    getSubmissionInvite(token),
    getMe(),
  ]);

  if (invitation.error) {
    return (
      <InvitationError
        lng={lng}
        message={invitation.error.message}
        code={invitation.error.code}
        currentEmail={user?.email}
        invitationHref={conferenceInvitationHref(
          lng,
          slug,
          submissionId,
          token,
        )}
        conferenceHref={conferenceWorkspaceHref(slug)}
      />
    );
  }

  const submission = invitation.submission;

  if (conference.attending) {
    if (conference.attending.ticket.withSubmission && submission && token) {
      const { success, message } = await acceptAuthorInvite(token);
      if (!success) {
        throw new Error(message);
      }
      redirect(conferenceWorkspaceHref(slug, true));
    }

    redirect(conferenceWorkspaceHref(slug));
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
