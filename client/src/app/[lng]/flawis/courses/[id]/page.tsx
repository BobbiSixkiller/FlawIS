import Heading from "@/components/Heading";
import { getCourse } from "./actions";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string; lng: string }>;
}) {
  const { id, lng } = await params;

  const course = await getCourse({ id });

  return (
    <div className="space-y-6">
      <Heading lng={lng} heading={course.name} />

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />
    </div>
  );
}
