import { redirect } from "next/navigation";
import { getMe } from "../../(auth)/actions";
import Link from "next/link";

export default async function Conferences({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();
  if (!user) {
    redirect(`/login?url=${encodeURIComponent(`/conferences`)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      Conferences<Link href="/conferences/test">link</Link>
    </div>
  );
}
