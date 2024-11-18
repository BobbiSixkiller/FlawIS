import { redirect } from "next/navigation";

export default function SubmissionPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return redirect(`/conferences/${slug}/submissions`);
}
