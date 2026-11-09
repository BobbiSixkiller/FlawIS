import FormLibrary from "@/components/form-library";
import { getFormLibrary, getFormVersions } from "@/lib/reviews/actions";
import { executeGqlFetch } from "@/lib/graphql/actions";
import { CoursesDocument } from "@/lib/graphql/generated/graphql";
export default async function FormsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ form?: string | string[] }>;
}) {
  const [{ lng }, query, forms, response] = await Promise.all([
    params,
    searchParams,
    getFormLibrary(),
    executeGqlFetch(
      CoursesDocument,
      { sort: [], first: 100 },
      null,
      undefined,
      "no-store",
    ),
  ]);
  const selected = forms.find((form) => form.id === query.form);
  const initialHistory = selected
    ? { definition: selected, versions: await getFormVersions(selected.id) }
    : null;
  return (
    <FormLibrary
      key={selected?.id || "library"}
      initialHistory={initialHistory}
      lng={lng}
      initial={forms}
      courses={
        response.data?.courses.edges?.flatMap((e) =>
          e?.node ? [{ id: e.node.id, name: e.node.name }] : [],
        ) || []
      }
    />
  );
}
