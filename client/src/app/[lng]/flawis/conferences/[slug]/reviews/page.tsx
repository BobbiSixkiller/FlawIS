import ConferenceReviewWorkspace from "@/app/[lng]/flawis/conferences/[slug]/reviews/_components/conference-review-workspace";
import { getConference } from "../../actions";
import {
  getReviewContext,
  getReviewQueue,
  getReviewSettings,
} from "@/lib/reviews/actions";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lng: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ lng, slug }, query] = await Promise.all([params, searchParams]);
  const conference = await getConference(slug);
  if (!conference) notFound();
  const value = (key: string) =>
    typeof query[key] === "string" ? (query[key] as string) : undefined;
  const [initial, settings, context] = await Promise.all([
    getReviewQueue(conference.id, undefined, value("after"), {
      search: value("search"),
    }),
    getReviewSettings(conference.id),
    getReviewContext(),
  ]);
  return (
    <ConferenceReviewWorkspace
      key={JSON.stringify(query)}
      initial={initial}
      slug={slug}
      lng={lng}
      enabled={Boolean(settings?.enabled)}
      canConfigure={
        context.isAdmin ||
        context.scopes.some((s) => s.conference === conference.id && !s.section)
      }
      sections={conference.sections.map((s) => ({
        value: s.id,
        label: s.translations[lng === "en" ? "en" : "sk"].name,
      }))}
    />
  );
}
