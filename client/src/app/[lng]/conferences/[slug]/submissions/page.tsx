import { redirect } from "next/navigation";
import { conferenceWorkspaceHref } from "@/lib/conferenceRegistration";

export default async function SubmissionsRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(conferenceWorkspaceHref(slug, true));
}
