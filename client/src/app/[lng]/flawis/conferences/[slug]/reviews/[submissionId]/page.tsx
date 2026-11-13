import { notFound } from "next/navigation";
import { getConference } from "../../../actions";
import {
  getReviewContext,
  getReviewDetail,
  getReviewSettings,
} from "@/lib/reviews/actions";
import SubmissionDetail from "@/app/[lng]/flawis/conferences/[slug]/reviews/[submissionId]/_components/submission-detail";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ lng: string; slug: string; submissionId: string }>;
}) {
  const { lng, slug, submissionId } = await params;
  if (!/^[a-f0-9]{24}$/i.test(submissionId)) notFound();
  const conference = await getConference(slug);
  if (!conference) notFound();
  const [detail, settings, context] = await Promise.all([
    getReviewDetail(submissionId),
    getReviewSettings(conference.id),
    getReviewContext(),
  ]);
  if (detail.conferenceId !== conference.id) notFound();
  return (
    <SubmissionDetail
      key={submissionId}
      initial={detail}
      slug={slug}
      lng={lng}
      settings={settings}
      sections={conference.sections.map((s) => ({
        value: s.id,
        label: s.translations[lng === "en" ? "en" : "sk"].name,
      }))}
      canManage={
        context.isAdmin ||
        context.scopes.some((s) => s.conference === conference.id && !s.section)
      }
    />
  );
}
