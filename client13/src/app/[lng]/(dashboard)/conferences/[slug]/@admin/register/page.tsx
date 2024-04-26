import { getConference } from "../../../actions";
import ConferenceRegistrationForm from "./ConferenceRegistrationForm";
import { getSubmission } from "./actions";

export default async function RegisterPage({
  params: { lng, slug },
  searchParams,
}: {
  params: { slug: string; lng: string };
  searchParams?: {
    submission?: string;
  };
}) {
  const [conference, submission] = await Promise.all([
    getConference(slug),
    getSubmission(searchParams?.submission),
  ]);

  return (
    <div className="flex justify-center">
      <ConferenceRegistrationForm
        lng={lng}
        conference={conference}
        submission={submission}
      />
    </div>
  );
}
