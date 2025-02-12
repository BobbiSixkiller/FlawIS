import { getMe } from "@/app/[lng]/(auth)/actions";
import { getInterns } from "./actions";
import ListInterns from "./ListInterns";
import { Access, Status } from "@/lib/graphql/generated/graphql";
import { getInternship } from "../actions";
import { redirect } from "next/navigation";

export default async function ApplicationsPage({
  params: { internshipId },
}: {
  params: { internshipId: string };
}) {
  // Implement checking if user with org access is viewing someone elses internship applications
  const [user, internship] = await Promise.all([
    getMe(),
    getInternship(internshipId),
  ]);

  if (!user.access.includes(Access.Admin) && user.id !== internship.user) {
    redirect(`/${internship}`);
  }

  const filter = user.access.includes(Access.Organization)
    ? {
        internship: internshipId,
        status: [Status.Eligible, Status.Accepted, Status.Rejected],
      }
    : { internship: internshipId };

  const initialData = await getInterns(filter);

  return <ListInterns initialData={initialData} filter={filter} />;
}
