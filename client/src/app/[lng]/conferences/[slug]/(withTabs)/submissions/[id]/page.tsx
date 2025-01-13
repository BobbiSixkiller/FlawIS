import { redirect, RedirectType } from "next/navigation";

export default function SubmissionPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return redirect(`/conferences/${slug}/submissions`, RedirectType.replace);
}
