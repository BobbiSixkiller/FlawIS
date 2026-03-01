import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Modal from "@/components/Modal";
import ModalTrigger from "@/components/ModalTrigger";
import { PlusIcon, TagIcon } from "@heroicons/react/24/outline";
import CourseForm from "./CourseForm";
import { getCourses } from "./actions";
import CourseList from "./CourseList";
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
            <TagIcon className="size-5" /> Kategórie
          </Button>,
          <ModalTrigger key={1} dialogId={createCourseDialogId}>
            <Button size="sm">
              <PlusIcon className="size-5" /> Nový
            </Button>
          </ModalTrigger>,
        ]}
      />

      <CourseList initialData={initialData} vars={{ sort: [] }} />

      <Modal dialogId={createCourseDialogId} title="Novy kurz">
        <CourseForm dialogId={createCourseDialogId} />
      </Modal>
    </div>
  );
}
