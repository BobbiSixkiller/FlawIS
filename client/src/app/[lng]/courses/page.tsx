import { getMe } from "../(auth)/actions";
import { translate } from "@/lib/i18n";
import { getCourses } from "../flawis/courses/actions";
import CourseList from "../flawis/courses/CourseList";

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;

  const { t, i18n } = await translate(lng, "dashboard");

  const initialData = await getCourses({ sort: [] });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold leading-7 text-center">Kurzy</h1>

      <CourseList initialData={initialData} vars={{ sort: [] }} />
    </div>
  );
}
