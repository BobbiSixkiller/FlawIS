"use client";

import {
  Access,
  AttendanceFragment,
  AttendanceQuery,
  AttendanceQueryVariables,
  Status,
} from "@/lib/graphql/generated/graphql";
import { cn, formatDatetimeLocal } from "@/utils/helpers";
import ModalTrigger from "@/components/ModalTrigger";
import Modal from "@/components/Modal";
import Link from "next/link";
import { changeCourseAttendeeStatus, getCourseAttendance } from "./actions";
import {
  Connection,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "@/components/Button";
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ChangeStatusForm from "../../../internships/[internshipId]/applications/[internId]/ChangeStatusForm";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import { deleteCourseAttendee, deleteCourseSession } from "../actions";
import CourseSessionForm from "../CourseSessionForm";
import useUser from "@/hooks/useUser";
import AttendanceRecordCell from "./HoursAttended";
import HoursAttended from "./HoursAttended";
import OnlineSwitch from "./OnlineSwitch";

interface ScrollState {
  vertical: boolean;
  horizontal: boolean;
}

function AttendanceTableContainer({
  children,
  sessions,
}: {
  children: React.ReactNode;
  sessions: AttendanceQuery["course"]["attendance"]["sessions"];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    vertical: false,
    horizontal: false,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handler = () => {
      const { scrollTop, scrollLeft } = el;
      setScrollState({
        vertical: scrollTop > 0,
        horizontal: scrollLeft > 0,
      });
    };

    handler();
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const user = useUser();
  const isAdmin = user?.access.includes(Access.Admin);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "overflow-auto max-h-[70vh] border dark:border-gray-600 rounded-lg text-sm w-fit max-w-full"
      )}
    >
      {/* This lets the inner table grow to content width */}
      <div className="inline-block min-w-max">
        {/* Header row */}
        <div
          className={cn(
            "sticky top-0 z-[19] grid grid-cols-[150px_auto] bg-gray-50 dark:bg-gray-800",
            scrollState.vertical && "shadow-bottom"
          )}
        >
          {/* Sticky left header cell */}
          <div
            className={cn(
              "p-2 w-[150px] min-w-[150px] max-w-[150px] inline-flex items-center justify-center",
              "sticky left-0 z-[19] text-nowrap bg-gray-50 dark:bg-gray-800 border-b border-r dark:border-gray-600 dark:text-white/85",
              scrollState.horizontal &&
                "shadow-[6px_0_8px_-4px_rgba(0,0,0,0.15)]"
            )}
          >
            Attendee / Session
          </div>

          {/* Session header cells (scroll horizontally with table) */}
          <div className="flex divide-x">
            {sessions.map((s) => (
              <div
                key={s?.id}
                className={cn([
                  "w-[120px] min-w-[120px] max-w-[120px] p-2 text-nowrap text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-200 inline-flex items-center gap-2",
                  "dark:bg-gray-800 dark:border-gray-600 dark:text-white/85",
                ])}
              >
                <ModalTrigger dialogId={`session:${s?.id}`}>
                  <button className="w-full cursor-pointer text-center">
                    <span className="hover:underline">
                      {formatDatetimeLocal(s?.start, false)}
                    </span>
                  </button>
                </ModalTrigger>
                {isAdmin && (
                  <ModalTrigger dialogId="delete-session">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-fit w-fit p-2"
                    >
                      <TrashIcon className="size-3" />
                    </Button>
                  </ModalTrigger>
                )}
                <Modal
                  dialogId={`session:${s?.id}`}
                  title={`${s?.name}, ${formatDatetimeLocal(s?.start, false)}`}
                >
                  <p>Zaciatok: {formatDatetimeLocal(s?.start, true)}</p>
                  <p>Koniec: {formatDatetimeLocal(s?.end, true)}</p>
                  {s?.description && (
                    <div
                      className="prose"
                      dangerouslySetInnerHTML={{ __html: s.description }}
                    />
                  )}

                  {isAdmin && (
                    <>
                      <ModalTrigger dialogId={`session:${s?.id}-edit`}>
                        <Button size="icon" className="mt-6">
                          <PencilIcon className="size-5" />
                        </Button>
                      </ModalTrigger>
                      <Modal
                        dialogId={`session:${s?.id}-edit`}
                        title="Upravit termin"
                      >
                        <CourseSessionForm
                          dialogId={`session:${s?.id}-edit`}
                          courseSession={s!}
                        />
                      </Modal>
                    </>
                  )}
                </Modal>
                <Modal dialogId="delete-session" title="Zmazat termin">
                  <ConfirmDeleteForm
                    dialogId="delete-session"
                    text={`Naozaj chcete zmazat termin ${formatDatetimeLocal(
                      s?.start,
                      false
                    )}`}
                    action={async () =>
                      await deleteCourseSession({ id: s?.id })
                    }
                  />
                </Modal>
              </div>
            ))}
          </div>
        </div>

        {/* Body rows */}
        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return child;
          }
          return cloneElement(child, { ...child.props, scrollState });
        })}
      </div>
    </div>
  );
}

function AttendanceRow({
  data,
  scrollState,
  sessions,
}: {
  data?: AttendanceFragment;
  scrollState?: ScrollState;
  sessions: AttendanceQuery["course"]["attendance"]["sessions"];
}) {
  const isAccepted = data?.attendee.status === Status.Accepted;
  const enableDelete = data?.attendee.status === Status.Rejected;

  const user = useUser();

  return (
    <>
      <div
        className={cn([
          "grid grid-cols-[150px_auto] relative border-b border-gray-100",
          "dark:border-gray-600",
        ])}
      >
        {/* Sticky attendee column */}
        <div
          className={cn([
            "dark:bg-gray-800 dark:border-gray-600 dark:text-white/85",
            "w-[150px] min-w-[150px] max-w-[150px] sticky left-0 z-10 bg-white p-2 truncate border-r flex items-center justify-center",
            scrollState?.horizontal &&
              "shadow-[6px_0_8px_-4px_rgba(0,0,0,0.15)]",
          ])}
        >
          {user?.access.includes(Access.Admin) ? (
            <ModalTrigger dialogId={`attendee:${data?.attendee.id}`}>
              <button className="w-full cursor-pointer text-center">
                <span className="hover:underline">
                  {data?.attendee.user.name}
                </span>
              </button>
            </ModalTrigger>
          ) : (
            <span>{data?.attendee.user.name}</span>
          )}
        </div>

        {/* Second column: either session cells or sticky "Change status!" */}
        <div className="relative">
          {isAccepted ? (
            <div className="flex divide-x dark:divide-gray-600">
              {data?.attendanceRecords.map((r, i) => {
                return (
                  <div
                    key={i}
                    className={cn([
                      "p-2 text-center w-[120px] min-w-[120px] max-w-[120px] flex justify-center items-center",
                      "dark:bg-gray-800 dark:text-white/85",
                    ])}
                  >
                    <OnlineSwitch
                      id={r!.id}
                      online={r?.online ?? false}
                      disabled={new Date(sessions[i]?.start) < new Date()}
                    />
                    <HoursAttended
                      id={r!.id}
                      hoursAttended={r!.hoursAttended}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // This stays stuck immediately to the right of the name
            <div
              className={cn([
                "sticky left-[150px] w-full p-2 inline-flex items-center gap-2 text-gray-600 bg-white z-10",
                "dark:bg-gray-800 dark:text-white/85",
              ])}
            >
              <ModalTrigger dialogId={`accept-dialog:${data?.attendee.id}`}>
                <Button
                  size="icon"
                  variant="positive"
                  className="h-fit w-fit p-2"
                >
                  <CheckIcon className="size-3" />
                </Button>
              </ModalTrigger>

              {enableDelete ? (
                <ModalTrigger dialogId={`delete-attendee:${data.attendee.id}`}>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-fit w-fit p-2"
                  >
                    <TrashIcon className="size-3" />
                  </Button>
                </ModalTrigger>
              ) : (
                <ModalTrigger dialogId={`reject-dialog:${data?.attendee.id}`}>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-fit w-fit p-2"
                  >
                    <XMarkIcon className="size-3" />
                  </Button>
                </ModalTrigger>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        dialogId={`attendee:${data?.attendee.id}`}
        title={data?.attendee.user.name}
      >
        Prilozene subory:
        <ul className="flex flex-wrap gap-2 max-w-sm">
          {data?.attendee.fileUrls.map((url, i) => {
            const fileName = url.split("/").pop()?.split("-").pop() || "File";
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
        </ul>
      </Modal>
      <Modal dialogId={`accept-dialog:${data?.attendee.id}`}>
        <ChangeStatusForm
          dialogId={`accept-dialog:${data?.attendee.id}`}
          status={Status.Accepted}
          action={async () =>
            changeCourseAttendeeStatus({
              id: data?.attendee.id,
              status: Status.Accepted,
            })
          }
        />
      </Modal>
      <Modal dialogId={`reject-dialog:${data?.attendee.id}`}>
        <ChangeStatusForm
          dialogId={`reject-dialog:${data?.attendee.id}`}
          status={Status.Rejected}
          action={async () =>
            changeCourseAttendeeStatus({
              id: data?.attendee.id,
              status: Status.Rejected,
            })
          }
        />
      </Modal>
      <Modal dialogId={`delete-attendee:${data?.attendee.id}`}>
        <ConfirmDeleteForm
          text={`Naozaj chcete zmazat ucastnika ${data?.attendee.user.name} ?`}
          dialogId={`delete-attendee:${data?.attendee.id}`}
          action={async () =>
            deleteCourseAttendee({
              id: data?.attendee.id,
            })
          }
        />
      </Modal>
    </>
  );
}

const AttendancePlaceholder = ({
  cardRef,
}: {
  cardRef?: React.Ref<HTMLDivElement>;
}) => (
  <div
    ref={cardRef}
    className={cn([
      "grid grid-cols-[150px_auto] relative border-b border-gray-100",
      "dark:border-gray-600",
    ])}
  >
    <div className="animate-pulse">
      <div className="h-2 bg-slate-200 dark:bg-slate-500 rounded w-1/3"></div>
    </div>
    <div className="animate-pulse">
      <div className="h-2 bg-slate-200 dark:bg-slate-500 rounded w-1/3"></div>
    </div>
  </div>
);

export function AttendanceTable({
  initialData,
  vars,
}: {
  initialData: Connection<AttendanceFragment>;
  vars: AttendanceQueryVariables;
}) {
  const InfiniteScrollCourseList = withInfiniteScroll<
    AttendanceFragment,
    AttendanceQueryVariables
  >({
    vars,
    getData: getCourseAttendance,
    initialData,
    ListItem: (props) => (
      <AttendanceRow sessions={initialData.sessions} {...props} />
    ),
    Container: (props) => (
      <AttendanceTableContainer sessions={initialData.sessions} {...props} />
    ),
    Placeholder: AttendancePlaceholder,
  });

  return <InfiniteScrollCourseList />;
}
