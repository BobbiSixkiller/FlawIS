import { redirect } from "next/navigation";
import { getConference } from "../../actions";
import { getReviewContext, getReviewSettings } from "@/lib/reviews/actions";
import ConferenceTemplates from "./_components/conference-templates";

export const dynamic = "force-dynamic";
export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { lng, slug } = await params;
  const [conference, context] = await Promise.all([
    getConference(slug),
    getReviewContext(),
  ]);
  if (!conference) return null;
  if (
    !context.isAdmin &&
    !context.scopes.some((s) => s.conference === conference.id && !s.section)
  )
    redirect(`/conferences/${slug}/reviews`);
  const settings = await getReviewSettings(conference.id);
  return (
    <ConferenceTemplates
      conference={conference.id}
      lng={lng}
      manuscript={conference.manuscriptTemplateFile}
      review={settings?.templateFile}
    />
  );
}
