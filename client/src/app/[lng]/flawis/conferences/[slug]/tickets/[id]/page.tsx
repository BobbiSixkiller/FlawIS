import { redirect } from "next/navigation";

export default function SectionPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return redirect(`/conferences/${slug}/tickets`);
}
