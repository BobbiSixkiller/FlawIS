import { notFound } from "next/navigation";
import {
  deleteCourseAttendee,
  getCourse,
} from "../../flawis/courses/[id]/actions";
import { Status } from "@/lib/graphql/generated/graphql";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import {
  InboxArrowDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import Link from "next/link";

import CourseApplication from "../../flawis/courses/[id]/CourseApplication";
import { getMe } from "../../(auth)/actions";
import Attendance from "./Attendance";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const { id, lng } = await params;

  const course = await getCourse({ id });
  if (!course) {
    return notFound();
  }

  const user = await getMe();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold leading-7 text-center">
        {course.name}
      </h1>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />

      {course.attending ? (
        <>
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
          {user && <Attendance id={id} />}
        </>
      ) : new Date() < new Date(course.registrationEnd) ? (
        <Button
          as={Link}
          href={`/${id}/register`}
          className="w-full"
          variant="positive"
          scroll={false}
          prefetch={false}
        >
          <InboxArrowDownIcon className="size-5 stroke-2 mr-2" />
          Prihlasit sa
        </Button>
      ) : null}

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
