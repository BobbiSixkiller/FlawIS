import { Status } from "@/lib/graphql/generated/graphql";
import { getInternship } from "../actions";
import ApplyForm from "./ApplicationForm";
import { getMe } from "@/app/[lng]/(auth)/actions";
import { redirect } from "next/navigation";

export default async function ApplyPage({
  params: { internshipId },
}: {
  params: { internshipId: string };
}) {
  const [internship, user] = await Promise.all([
    getInternship(internshipId),
    getMe(),
  ]);

  if (
    internship.myApplication &&
    internship.myApplication?.status !== Status.Applied
  ) {
    redirect(`/${internshipId}`);
  }

  return <ApplyForm user={user} application={internship.myApplication} />;
}
