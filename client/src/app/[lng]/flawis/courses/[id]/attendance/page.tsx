import Heading from "@/components/Heading";
import CloseButton from "@/components/CloseButton";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import CourseSessionForm from "../CourseSessionForm";
import { getCourseAttendance } from "./actions";
import { formatDatetimeLocal } from "@/utils/helpers";
import { Status } from "@/lib/graphql/generated/graphql";
import { getCourse } from "../actions";
import { AttendanceTable } from "./AttendanceTable";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const { id, lng } = await params;
  const course = await getCourse({ id });
  const attendance = await getCourseAttendance({ id, sort: [] });

  return (
    <div className="space-y-6">
      <Heading
        lng={lng}
        heading={course.name}
        items={[
          <CloseButton href={`/courses/${id}`} key={0} />,
          <ModalTrigger dialogId="add-course-session" key={1}>
            <Button size="icon" className="rounded-full" variant="positive">
              <PlusIcon className="size-5" />
            </Button>
          </ModalTrigger>,
        ]}
      />

      <AttendanceTable initialData={attendance} vars={{ id, sort: [] }} />

      <Modal dialogId="add-course-session" title="Pridat termin">
        <CourseSessionForm dialogId="add-course-session" />
      </Modal>
    </div>
  );
}
