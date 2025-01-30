import { getMe } from "@/app/[lng]/(auth)/actions";
import { getInterns } from "./actions";
import ListInterns from "./ListInterns";
import { Access, Status } from "@/lib/graphql/generated/graphql";

export default async function ApplicationsPage({
  params: { internshipId },
}: {
  params: { internshipId: string };
}) {
  const user = await getMe();

  const filter = user.access.includes(Access.Organization)
    ? {
        internship: internshipId,
        status: [Status.Eligible, Status.Accepted, Status.Rejected],
      }
    : { internship: internshipId };

  const initialData = await getInterns(filter);

  return <ListInterns initialData={initialData} filter={filter} />;
}
