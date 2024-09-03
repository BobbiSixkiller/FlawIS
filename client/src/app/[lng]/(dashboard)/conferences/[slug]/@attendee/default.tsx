import { redirect } from "next/navigation";

export default function Default({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return redirect(`/conferences/${slug}`);
}
