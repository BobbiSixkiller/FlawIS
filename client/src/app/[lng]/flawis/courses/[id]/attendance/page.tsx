import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import Heading from "@/components/heading";
import CloseButton from "@/components/close-button";
import ModalTrigger from "@/components/modal-trigger";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import CourseSessionForm from "../course-session-form";
import { getCourseAttendance } from "./actions";
import { getCourse } from "../actions";
import { AttendanceTable } from "./attendance-table";
import ExportButton from "@/components/export-button";

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
          <CloseButton href={`/courses/${id}`} key={0} />,
          <ModalTrigger
            dialogId="add-course-session"
            key={1}
            size="icon"
            className="rounded-full"
            variant="positive"
          >
            <Icon name="plus" className="size-5" />
          </ModalTrigger>,
          <ExportButton
            key={2}
            fetchUrl={`/export?type=courseAttendees&id=${id}`}
          />,
        ]}
      />

      <AttendanceTable
        initialData={attendance}
        vars={{ id, sort: [] }}
        registrationForm={course.registrationForm}
      />

      <Modal dialogId="add-course-session" title="Pridat termin">
        <CourseSessionForm dialogId="add-course-session" />
      </Modal>
    </div>
  );
}
