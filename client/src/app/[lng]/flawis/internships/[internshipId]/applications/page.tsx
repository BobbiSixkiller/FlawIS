import { getInterns } from "@/app/[lng]/internships/[internshipId]/applications/actions";
import ListInterns from "@/app/[lng]/internships/[internshipId]/applications/ListInterns";
import { InternsQueryVariables } from "@/lib/graphql/generated/graphql";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ internshipId: string }>;
}) {
  const { internshipId } = await params;

  const vars: InternsQueryVariables = {
    sort: [],
    filter: { internship: internshipId },
  };

  const initialData = await getInterns(vars);

  return <ListInterns initialData={initialData} vars={vars} />;
}
