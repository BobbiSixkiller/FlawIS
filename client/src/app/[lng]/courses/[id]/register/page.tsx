import { getCourse } from "@/app/[lng]/flawis/courses/[id]/actions";
import CourseRegistrationForm from "@/app/[lng]/flawis/courses/[id]/CourseRegistrationForm";
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
  if (course && course.attending) {
    return redirect(`/${id}`);
  }

  return <CourseRegistrationForm course={course} redirect={`/${id}`} />;
}
