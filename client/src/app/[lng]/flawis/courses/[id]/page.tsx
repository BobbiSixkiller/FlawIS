import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import Heading from "@/components/heading";
import { deleteCourse, getCourse, getCourseReachConfig } from "./actions";
import ModalTrigger from "@/components/modal-trigger";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import { redirect } from "next/navigation";
import CloseButton from "@/components/close-button";
import Link from "next/link";
import CourseForm from "../course-form";
import Spinner from "@/components/spinner";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string; lng: string }>;
}) {
  const { id, lng } = await params;

  const [course, reachCourseConfig] = await Promise.all([
    getCourse({ id }),
    getCourseReachConfig({ courseId: id }),
  ]);
  if (!course) {
    redirect("/courses");
  }

  return (
    <div className="space-y-6">
      <BreadcrumbLabel
        param="id"
        value={id}
        path={`/flawis/courses/${encodeURIComponent(id)}`}
        label={course.name}
      />
      <Heading
        lng={lng}
        heading={course.name}
        items={[
          <CloseButton href="/courses" key={0} />,
          <ModalTrigger
            dialogId="delete-course"
            key={1}
            size="icon"
            className="rounded-full"
            variant="destructive"
          >
            <Icon name="trash" className="size-5" />{" "}
            <span className="sm:hidden">Zmazat</span>
          </ModalTrigger>,
          <ModalTrigger
            dialogId="edit-course"
            key={2}
            size="icon"
            className="rounded-full"
          >
            <Icon name="pencil" className="size-5" />{" "}
            <span className="sm:hidden">Upravit</span>
          </ModalTrigger>,
          <Button
            key={3}
            size="icon"
            className="rounded-full"
            nativeButton={false}
            role="link"
            render={<Link href={`/courses/${id}/attendance`} />}
          >
            <Icon name="users" className="size-5" />
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
      <Modal dialogId="edit-course" title="Upravit">
        <CourseForm
          dialogId={"edit-course"}
          course={course}
          reachCourseConfig={reachCourseConfig}
        />
      </Modal>
    </div>
  );
}
