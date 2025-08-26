import { getMe } from "@/app/[lng]/(auth)/actions";
import { getInterns } from "./actions";
import ListInterns from "./ListInterns";
import {
  Access,
  InternsQueryVariables,
  Status,
} from "@/lib/graphql/generated/graphql";
import { getInternship } from "../actions";
import { redirect } from "next/navigation";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ internshipId: string }>;
}) {
  const { internshipId } = await params;
  // Implement backend checking if user with org access is viewing someone elses internship applications
  const [user, internship] = await Promise.all([
    getMe(),
    getInternship(internshipId),
  ]);
  if (!internship) {
    redirect("/");
  }
  if (!user.access.includes(Access.Admin) && user.id !== internship.user) {
    redirect(`/${internship}`);
  }

  const vars: InternsQueryVariables = {
    sort: [],
    filter: user.access.includes(Access.Organization)
      ? {
          internship: internshipId,
          status: [Status.Eligible, Status.Accepted, Status.Rejected],
        }
      : { internship: internshipId },
  };

  const initialData = await getInterns(vars);

  return <ListInterns initialData={initialData} vars={vars} />;
}
