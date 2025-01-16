import { getInterns } from "@/app/[lng]/internships/[internshipId]/applications/actions";
import ListInterns from "@/app/[lng]/internships/[internshipId]/applications/ListInterns";

export default async function ApplicationsPage({
  params: { internshipId },
}: {
  params: { internshipId: string };
}) {
  const filter = { internship: internshipId };

  const initialData = await getInterns(filter);

  return <ListInterns initialData={initialData} filter={filter} />;
}
