import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Modal from "@/components/Modal";
import ModalTrigger from "@/components/ModalTrigger";
import { translate } from "@/lib/i18n";
import { PlusIcon } from "@heroicons/react/24/outline";
import CourseForm from "./CourseForm";

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const createCourseDialogId = "create-course";

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading="Kurzy"
        subHeading="Kurzy na falkute"
        links={[
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId={createCourseDialogId}>
                <Button size="sm">
                  <PlusIcon className="size-5" /> Novy
                </Button>
              </ModalTrigger>
            ),
          },
        ]}
      />

      <Modal dialogId={createCourseDialogId} title="Novy kurz">
        <CourseForm dialogId={createCourseDialogId} />
      </Modal>
    </div>
  );
}
