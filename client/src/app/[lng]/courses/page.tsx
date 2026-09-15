import { getCourses } from "../flawis/courses/actions";
import OfferingList from "@/components/OfferingList";
import UrlFilter from "@/components/UrlFilter";
import { translate } from "@/lib/i18n";
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
  const { t } = await translate(lng, "courses");
  const queryParams = await searchParams;

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
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold leading-tight">
          {t("catalogue.title")}
        </h1>
        <UrlFilter
          lng={lng}
          label={t("catalogue.categories")}
          filters={[
            {
              label: t("catalogue.categories"),
              queryKey: "category",
              type: "multi",
              options: initialData.availableCategories.map((category) => ({
                value: category.slug,
                label: category.name,
                count: category.count,
              })),
            },
          ]}
        />
      </div>

      <OfferingList
        kind="course"
        initialData={initialData}
        vars={vars}
        hrefBase=""
        lng={lng}
      />
    </div>
  );
}
