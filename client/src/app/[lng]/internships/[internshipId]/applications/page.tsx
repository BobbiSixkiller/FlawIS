import { getInterns } from "./actions";
import ListInterns from "./ListInterns";

export default async function ApplicationsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const initialData = await getInterns({ internship: id });
  console.log(initialData);

  return <ListInterns initialData={initialData} filter={{ internship: id }} />;
}
