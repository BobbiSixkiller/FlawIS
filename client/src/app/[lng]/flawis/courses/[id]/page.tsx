import Heading from "@/components/Heading";
import { deleteCourse, deleteCourseAttendee, getCourse } from "./actions";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import {
  EnvelopeIcon,
  InboxArrowDownIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import CourseForm from "../CourseForm";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import { redirect } from "next/navigation";
import CloseButton from "@/components/CloseButton";
import Link from "next/link";
import CourseRegistrationForm from "./CourseRegistrationForm";
import Avatar from "@/components/Avatar";
import {
  CourseAttendeeFragment,
  Status,
} from "@/lib/graphql/generated/graphql";
import { displayDate } from "@/utils/helpers";
import { ReactNode } from "react";
import CourseApplication from "./CourseApplication";

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

      {course.attending ? (
        <CourseApplication
          lng={lng}
          courseAttendee={course.attending}
          controls={
            <div className="flex gap-2">
              {course.attending.status === Status.Applied && (
                <ModalTrigger dialogId="delete-course-application">
                  <Button variant="destructive" size="icon">
                    <TrashIcon className="size-5" />
                  </Button>
                </ModalTrigger>
              )}
              {course.attending.status !== Status.Accepted && (
                <ModalTrigger dialogId="course-application">
                  <Button size="icon">
                    <PencilIcon className="size-5" />
                  </Button>
                </ModalTrigger>
              )}
            </div>
          }
        />
      ) : new Date() < new Date(course.registrationEnd) ? (
        <ModalTrigger dialogId="course-application">
          <Button className="w-full" variant="positive">
            <InboxArrowDownIcon className="size-5 stroke-2 mr-2" />
            Prihlasit sa
          </Button>
        </ModalTrigger>
      ) : null}

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
      <Modal dialogId="course-application" title="Registracia na kurz">
        <CourseRegistrationForm course={course} dialogId="course-application" />
      </Modal>
      <Modal dialogId="delete-course-application" title="Zrusit registraciu">
        <ConfirmDeleteForm
          dialogId="delete-course-application"
          text="Naozaj chcete zrusit Vasu registraciu?"
          action={async () => {
            "use server";
            return await deleteCourseAttendee({ id: course.attending?.id });
          }}
        />
      </Modal>
    </div>
  );
}
