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

  console.log(course.attending);

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

function CourseApplication({
  courseAttendee,
  lng,
  controls,
}: {
  courseAttendee: CourseAttendeeFragment;
  lng: string;
  controls: ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg border border-primary-500 bg-primary-100 dark:text-white/85 dark:bg-primary-800 shadow-sm space-y-3">
      <h2 className="text-xl text-primary-500 dark:text-primary-400 font-semibold">
        Prihláška
      </h2>

      <div className="flex items-center flex-wrap gap-6">
        <div className="relative flex items-center gap-x-4">
          <Avatar
            name={courseAttendee.user.name}
            avatarUrl={courseAttendee.user.avatarUrl}
          />
          <div className="">
            <p className="font-semibold text-gray-900 dark:text-white">
              {courseAttendee.user.name}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {courseAttendee.user.organization}
            </p>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <p>Kontakt:</p>
            <ul className="flex flex-wrap gap-2">
              <li>
                <a
                  className="text-primary-500 dark:text-primary-400 hover:underline inline-flex gap-1 items-center"
                  href={`mailto:${courseAttendee.user.email}`}
                >
                  <EnvelopeIcon className="size-4" />{" "}
                  {courseAttendee.user.email}
                </a>
              </li>
              {courseAttendee.user.telephone && (
                <li>
                  <a
                    className="text-primary-500 dark:text-primary-400 hover:underline inline-flex gap-1 items-center"
                    href={`tel:${courseAttendee.user.telephone}`}
                  >
                    <PhoneIcon className="size-4" />{" "}
                    {courseAttendee.user.telephone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <p>Dokumenty</p>
            <ul className="flex flex-wrap gap-2">
              {courseAttendee.fileUrls.map((url, i) => {
                const fileName =
                  url.split("/").pop()?.split("-").pop() || "File";

                return (
                  <li key={i}>
                    <Link
                      className="text-primary-500 dark:text-primary-400 hover:underline"
                      href={`/minio?bucketName=courses&url=${url}`}
                    >
                      {fileName}
                    </Link>
                  </li>
                );
              })}
              {/* {application.organizationFeedbackUrl && (
                <li>
                  <Link
                    className="text-primary-500 dark:text-primary-400 hover:underline"
                    href={`/minio?bucketName=internships&url=${application.organizationFeedbackUrl}`}
                  >
                    {application.organizationFeedbackUrl
                      .split("/")
                      .pop()
                      ?.split("-")
                      .pop() || "File"}
                  </Link>
                </li>
              )} */}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 justify-between">
        <div className="flex flex-col">
          Status: {courseAttendee.status}
          <span className="text-sm">
            Aktualizovane {displayDate(courseAttendee.updatedAt, lng)}
          </span>
        </div>

        {controls}
      </div>
    </div>
  );
}
