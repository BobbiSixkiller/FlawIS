import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { getCourse } from "@/app/[lng]/flawis/courses/[id]/actions";
import CourseRegistrationForm from "@/app/[lng]/flawis/courses/[id]/course-registration-form";
import { notFound, redirect } from "next/navigation";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse({ id });
  if (!course) {
    return notFound();
  }
  if (course.attending || new Date(course.registrationEnd) < new Date()) {
    return redirect(`/${id}`);
  }

  return (
    <>
      <BreadcrumbLabel
        param="id"
        value={id}
        path={`/courses/${encodeURIComponent(id)}`}
        label={course.name}
      />
      <CourseRegistrationForm course={course} redirect={`/${id}`} />
    </>
  );
}
