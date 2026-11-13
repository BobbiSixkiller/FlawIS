import ReviewerDirectory from "@/app/[lng]/flawis/reviewers/_components/reviewer-directory";
import { getReviewContext, getReviewerDirectory } from "@/lib/reviews/actions";
export default async function ReviewersPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ search?: string | string[] }>;
}) {
  const [{ lng }, query] = await Promise.all([params, searchParams]);
  const search = typeof query.search === "string" ? query.search : "";
  const [reviewers, context] = await Promise.all([
    getReviewerDirectory(search),
    getReviewContext(),
  ]);
  return (
    <ReviewerDirectory
      key={search}
      search={search}
      initial={reviewers}
      lng={lng}
      canManage={context.isAdmin || context.scopes.some((s) => !s.section)}
    />
  );
}
