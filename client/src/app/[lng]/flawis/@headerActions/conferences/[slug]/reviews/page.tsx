import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import SearchSubmission from "./search-submission";
export default async function ReviewControls({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const conference = await getConference(slug);
  if (!conference) return null;
  return <SearchSubmission conference={conference.id} slug={slug} />;
}
