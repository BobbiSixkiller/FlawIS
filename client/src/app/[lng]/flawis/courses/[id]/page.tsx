import Heading from "@/components/Heading";
import { deleteCourse, getCourse } from "./actions";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import CourseForm from "../CourseForm";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import { redirect } from "next/navigation";
import CloseButton from "@/components/CloseButton";
import CourseSessionForm from "./CourseSessionForm";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string; lng: string }>;
}) {
  const { id, lng } = await params;

  const course = await getCourse({ id });
  if (!course) {
    redirect("/courses");
  }

  return (
    <div className="space-y-6">
      <Heading
        lng={lng}
        heading={course.name}
        links={[
          { type: "custom", element: <CloseButton href="/courses" /> },
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId="delete-course">
                <Button
                  size="icon"
                  className="rounded-full"
                  variant="destructive"
                >
                  <TrashIcon className="size-5" />
                </Button>
              </ModalTrigger>
            ),
          },
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId="edit-course">
                <Button size="icon" className="rounded-full" variant="default">
                  <PencilIcon className="size-5" />
                </Button>
              </ModalTrigger>
            ),
          },
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId="add-course-session">
                <Button size="icon" className="rounded-full" variant="positive">
                  <PlusIcon className="size-5" />
                </Button>
              </ModalTrigger>
            ),
          },
        ]}
      />

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />

      <Modal dialogId="edit-course" title="Upravit kurz">
        <CourseForm dialogId="edit-course" course={course} />
      </Modal>
      <Modal dialogId="delete-course" title="Zmazat kurz">
        <ConfirmDeleteForm
          dialogId="delete-course"
          text={`Naozaj chcete zmazat kurz: ${course.name}`}
          action={async () => {
            "use server";
            return deleteCourse({ id });
          }}
        />
      </Modal>
      <Modal dialogId="add-course-session" title="Pridat termin">
        <CourseSessionForm dialogId="add-course-session" />
      </Modal>
    </div>
  );
}
