import { getMe } from "@/app/[lng]/(auth)/actions";
import { getConference } from "../../../actions";
import ConferenceRegistrationForm from "./ConferenceRegistrationForm";
import { getSubmission } from "./actions";
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
  if (conference && conference.attending) {
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
