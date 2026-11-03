import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { notFound } from "next/navigation";
import {
  deleteCourseAttendee,
  getCourse,
} from "../../flawis/courses/[id]/actions";
import { InvoiceOwnerType, Status } from "@/lib/graphql/generated/graphql";
import ModalTrigger from "@/components/modal-trigger";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import Link from "next/link";

import CourseApplication from "../../flawis/courses/[id]/course-application";
import Attendance from "./attendance";
import CourseRegistrationForm from "../../flawis/courses/[id]/course-registration-form";
import DownloadInvoiceButton from "@/components/download-invoice-button";
import ElearningAccess from "./elearning-access";

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

  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbLabel
        param="id"
        value={id}
        path={`/courses/${encodeURIComponent(id)}`}
        label={course.name}
      />
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
              <div className="flex flex-wrap gap-2">
                {course.attending.hasInvoice && (
                  <DownloadInvoiceButton
                    attendeeId={course.attending.id}
                    lng={lng}
                    ownerType={InvoiceOwnerType.CourseAttendee}
                  />
                )}
                {course.attending.status === Status.Applied && (
                  <ModalTrigger
                    dialogId="delete-course-application"
                    variant="destructive"
                    size="icon"
                  >
                    <Icon name="trash" className="size-5" />
                  </ModalTrigger>
                )}
                {course.attending.status !== Status.Accepted && (
                  <ModalTrigger dialogId="course-application" size="icon">
                    <Icon name="pencil" className="size-5" />
                  </ModalTrigger>
                )}
              </div>
            }
          />
          <ElearningAccess access={course.elearningAccess} />
          <Attendance id={id} registrationForm={course.registrationForm} />
        </>
      ) : new Date() < new Date(course.registrationEnd) ? (
        <Button
          className="w-full"
          variant="positive"
          nativeButton={false}
          role="link"
          render={
            <Link href={`/${id}/register`} scroll={false} prefetch={false} />
          }
        >
          <Icon name="inbox-arrow-down" className="size-5 stroke-2 mr-2" />
          Prihlasit sa
        </Button>
      ) : (
        <div className="text-center rounded-lg p-4 border border-orange-300 bg-orange-100 text-orange-500  dark:border-orange-500 dark:bg-orange-300 dark:text-orange-700">
          Registrácia už skončila
        </div>
      )}

      <Modal dialogId="delete-course-application" title="Zrušiť registráciu">
        <ConfirmDeleteForm
          dialogId="delete-course-application"
          text="Naozaj chcete zrušiť Vašu registráciu?"
          action={async () => {
            "use server";
            if (!course.attending) notFound();
            return await deleteCourseAttendee({ id: course.attending.id });
          }}
        />
      </Modal>
      <Modal dialogId="course-application" title="Registrácia na kurz">
        <CourseRegistrationForm course={course} dialogId="course-application" />
      </Modal>
    </div>
  );
}
