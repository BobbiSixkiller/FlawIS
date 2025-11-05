"use client";

import { useIntersectionObserver } from "@uidotdev/usehooks";
import { AttendanceQuery, Status } from "@/lib/graphql/generated/graphql";
import { formatDatetimeLocal } from "@/utils/helpers";
import ModalTrigger from "@/components/ModalTrigger";
import Modal from "@/components/Modal";
import Link from "next/link";

export default function AttendanceTable({
  course,
}: {
  course: AttendanceQuery["course"];
}) {
  const [ref, entry] = useIntersectionObserver({
    threshold: 0,
    root: null,
    rootMargin: "0px",
  });

  console.log(entry);

  return (
    <div>
      {/* Container controlling horizontal scroll */}
      <div className="overflow-x-auto border rounded-lg text-sm" ref={ref}>
        <table className="border-collapse min-w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b border-gray-200 divide-x">
              {/* Fixed Attendee column */}
              <th className="p-2 w-48 bg-white text-left sticky left-0 border-r border-gray-200 z-10 truncate">
                Attendee / Session
              </th>

              {/* Scrollable session headers */}
              {course.attendance.sessions.map((s) => (
                <th
                  key={s?.id}
                  className="p-2 w-fit text-nowrap text-sm font-medium text-gray-600"
                >
                  {formatDatetimeLocal(s?.start, false)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {course.attendance.edges.map((edge) => (
              <tr key={edge?.cursor} className="hover:bg-gray-50">
                {/* Fixed attendee column */}
                <td className="p-2 w-fit max-w-[100px] bg-white sticky left-0 border-r border-gray-200 z-10 truncate">
                  <ModalTrigger dialogId={`attendee:${edge?.node.attendee.id}`}>
                    <button className="w-full cursor-pointer">
                      {edge?.node.attendee.user.name}
                    </button>
                  </ModalTrigger>

                  <Modal
                    dialogId={`attendee:${edge?.node.attendee.id}`}
                    title={edge?.node.attendee.user.email}
                  >
                    {edge?.node.attendee.fileUrls.map((url, i) => {
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
                  </Modal>
                </td>

                {/* Scrollable session cells */}
                {edge?.node.attendee.status === Status.Accepted ? (
                  edge?.node.attendanceRecords.map((r, i) => (
                    <td key={i} className="p-2 text-center">
                      attendance
                    </td>
                  ))
                ) : (
                  <td
                    colSpan={course.attendance.sessions.length}
                    className="p-2"
                  >
                    Change status!
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
