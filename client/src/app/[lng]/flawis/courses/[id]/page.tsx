import Heading from "@/components/Heading";
import { deleteCourse, getCourse } from "./actions";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import { PencilIcon, TrashIcon, UsersIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import { redirect } from "next/navigation";
import CloseButton from "@/components/CloseButton";
import Link from "next/link";

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
        items={[
          <CloseButton href="/courses" key={0} />,
          <ModalTrigger dialogId="delete-course" key={1}>
            <Button size="icon" className="rounded-full" variant="destructive">
              <TrashIcon className="size-5" />{" "}
              <span className="sm:hidden">Zmazat</span>
            </Button>
          </ModalTrigger>,
          <ModalTrigger dialogId="edit-course" key={2}>
            <Button size="icon" className="rounded-full">
              <PencilIcon className="size-5" />{" "}
              <span className="sm:hidden">Upravit</span>
            </Button>
          </ModalTrigger>,
          <Button
            key={3}
            as={Link}
            size="icon"
            className="rounded-full"
            href={`/courses/${id}/attendance`}
          >
            <UsersIcon className="size-5" />
            <span className="sm:hidden">Dochadzka</span>
          </Button>,
        ]}
      />

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />

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
    </div>
  );
}
