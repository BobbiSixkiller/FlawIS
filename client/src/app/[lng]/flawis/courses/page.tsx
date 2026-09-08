import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Modal from "@/components/Modal";
import ModalTrigger from "@/components/ModalTrigger";
import Icon from "@/components/Icon";
import CourseForm from "./CourseForm";
import { getCourses } from "./actions";
import OfferingList from "@/components/OfferingList";
import Link from "next/link";

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const createCourseDialogId = "create-course";

  const initialData = await getCourses({ sort: [] });

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading="Kurzy"
        subHeading="Kurzy na falkute"
        items={[
          <Button key={0} as={Link} href="/courses/categories" size="sm" variant="secondary">
            <Icon name="tag" className="size-5" /> Kategórie
          </Button>,
          <ModalTrigger key={1} dialogId={createCourseDialogId}>
            <Button size="sm">
              <Icon name="plus" className="size-5" /> Nový
            </Button>
          </ModalTrigger>,
        ]}
      />

      <OfferingList
        kind="course"
        initialData={initialData}
        vars={{ sort: [] }}
        hrefBase="/courses"
        lng={lng}
      />

      <Modal dialogId={createCourseDialogId} title="Novy kurz">
        <CourseForm dialogId={createCourseDialogId} />
      </Modal>
    </div>
  );
}
