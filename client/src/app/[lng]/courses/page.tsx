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

  const categoryIds = queryParams?.category
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
    filter: { categoryIds },
  };

  const initialData = await getCourses(vars);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center gap-6">
        <h1 className="text-3xl font-bold leading-7 text-center">Kurzy</h1>
        <FilterDropdown
          anchor={{ gap: 6, to: "bottom" }}
          filters={[
            {
              label: "Kategórie",
              type: "multi",
              queryKey: "category",
              options: initialData.availableCategories.map((c) => ({
                label: `${c.name} (${c.count})`,
                value: String(c.id),
              })),
            },
          ]}
        />
      </div>

      <CourseList initialData={initialData} vars={vars} />
    </div>
  );
}
