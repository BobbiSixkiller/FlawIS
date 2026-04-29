import { getMe } from "../(auth)/actions";
import { translate } from "@/lib/i18n";
import { getCourses } from "../flawis/courses/actions";
import CourseList from "../flawis/courses/CourseList";
import FilterDropdown from "@/components/FilterDropdown";
import {
  CourseSortableField,
  CoursesQueryVariables,
  SortDirection,
} from "@/lib/graphql/generated/graphql";

export default async function CoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams?: Promise<{ category?: string | string[] }>;
}) {
  const { lng } = await params;
  const queryParams = await searchParams;

  const { t, i18n } = await translate(lng, "dashboard");

  const categorySlugs = queryParams?.category
    ? Array.isArray(queryParams.category)
      ? queryParams.category
      : [queryParams.category]
    : [];

  const vars: CoursesQueryVariables = {
    sort: [
      {
        field: CourseSortableField.RegistrationEnd,
        direction: SortDirection.Desc,
      },
    ],
    filter: { categorySlugs },
  };

  const initialData = await getCourses(vars);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-y-6">
      <div className="col-span-full row-start-1 flex items-center justify-center">
        <h1 className="text-3xl font-bold leading-7 text-center">Kurzy</h1>
      </div>

      <FilterDropdown
        wrapperClassName="fixed bottom-6 right-6 z-50 sm:sticky sm:top-4 sm:bottom-auto sm:right-auto sm:col-start-2 sm:row-start-1 sm:z-30 sm:justify-self-end sm:self-start"
        className="p-2"
        anchor={{ gap: 6, to: "bottom end" }}
        filters={[
          {
            label: "Kategórie",
            type: "multi",
            queryKey: "category",
            options: initialData.availableCategories.map((c) => ({
              label: `${c.name} (${c.count})`,
              value: c.slug,
            })),
          },
        ]}
      />

      <div className="col-span-full row-start-2">
        <CourseList initialData={initialData} vars={vars} />
      </div>
    </div>
  );
}
