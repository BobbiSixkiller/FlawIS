import { getMe } from "@/app/[lng]/(auth)/actions";
import { getInterns } from "./actions";
import ListInterns from "./ListInterns";
import {
  InternsQueryVariables,
  Status,
} from "@/lib/graphql/generated/graphql";
import { getInternship } from "../actions";
import { notFound, redirect } from "next/navigation";
import { getInternshipAccess } from "@/lib/internshipAccess";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ internshipId: string }>;
}) {
  const { internshipId } = await params;
  const [user, internship] = await Promise.all([
    getMe(),
    getInternship(internshipId),
  ]);
  if (!internship) {
    notFound();
  }

  const access = getInternshipAccess(user, internship.user);
  if (!access.canManage) {
    redirect(`/${internshipId}`);
  }

  const vars: InternsQueryVariables = {
    sort: [],
    filter: {
      internship: internshipId,
      status: [Status.Eligible, Status.Accepted, Status.Rejected],
    },
  };

  const initialData = await getInterns(vars);

  return <ListInterns initialData={initialData} vars={vars} hrefBase="" />;
}
