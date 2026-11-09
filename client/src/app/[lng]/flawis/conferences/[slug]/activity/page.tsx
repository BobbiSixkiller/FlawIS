import { getConference } from "../../actions";
import { getActivity } from "@/lib/reviews/actions";
import ActivityTimeline from "@/components/activity-timeline";
export const dynamic = "force-dynamic";
export default async function ActivityPage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { slug, lng } = await params;
  const conference = await getConference(slug);
  if (!conference) return null;
  const events = await getActivity(conference.id);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">
        {lng === "en" ? "Conference activity" : "História konferencie"}
      </h1>
      <ActivityTimeline initial={events} conference={conference.id} lng={lng} />
    </div>
  );
}
