import ReviewSettings from "@/app/[lng]/flawis/conferences/[slug]/review-settings/_components/review-settings";
import { getConference } from "../../actions";
import {
  getCoordinators,
  getFormLibrary,
  getReviewContext,
  getReviewSettings,
} from "@/lib/reviews/actions";
export const dynamic = "force-dynamic";
export default async function ReviewSettingsPage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { lng, slug } = await params;
  const conference = await getConference(slug);
  if (!conference) return null;
  const [settings, forms, context, coordinatorData] = await Promise.all([
    getReviewSettings(conference.id),
    getFormLibrary(),
    getReviewContext(),
    getCoordinators(conference.id),
  ]);
  return (
    <ReviewSettings
      key={settings?.id || "new"}
      lng={lng}
      conference={conference.id}
      settings={settings}
      forms={forms}
      isAdmin={context.isAdmin}
      grants={
        coordinatorData.grants as {
          id: string;
          person: string;
          section: string | null;
        }[]
      }
      sections={conference.sections.map((s) => ({
        value: s.id,
        label: s.translations[lng === "en" ? "en" : "sk"].name,
      }))}
    />
  );
}
