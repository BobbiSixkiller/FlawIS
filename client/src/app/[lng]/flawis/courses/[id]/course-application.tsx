import Avatar from "@/components/avatar";
import { CourseAttendeeFragment } from "@/lib/graphql/generated/graphql";
import { displayDate } from "@/lib/utilsClient";
import Icon from "@/components/icon";
import Link from "next/link";
import { ReactNode } from "react";

export default function CourseApplication({
  courseAttendee,
  lng,
  controls,
}: {
  courseAttendee: CourseAttendeeFragment;
  lng: string;
  controls: ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg border border-primary bg-accent dark:text-foreground dark:bg-primary-800 shadow-xs space-y-3">
      <h2 className="text-xl text-primary dark:text-primary font-semibold">
        Prihláška
      </h2>

      <div className="flex flex-col gap-6">
        <div className="relative flex gap-x-4">
          <Avatar
            name={courseAttendee.user.name}
            avatarUrl={courseAttendee.user.avatarUrl}
            size="large"
          />
          <div className="">
            <p className="font-semibold text-foreground dark:text-foreground">
              {courseAttendee.user.name}
            </p>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {courseAttendee.user.organization}
            </p>
          </div>
        </div>

        <div className="">
          <div className="flex flex-wrap gap-2">
            <p>Kontakt:</p>
            <ul className="flex flex-wrap gap-2">
              <li>
                <a
                  className="text-primary dark:text-primary hover:underline inline-flex gap-1 items-center"
                  href={`mailto:${courseAttendee.user.email}`}
                >
                  <Icon name="envelope" className="size-4" />{" "}
                  {courseAttendee.user.email}
                </a>
              </li>
              {courseAttendee.user.telephone && (
                <li>
                  <a
                    className="text-primary dark:text-primary hover:underline inline-flex gap-1 items-center"
                    href={`tel:${courseAttendee.user.telephone}`}
                  >
                    <Icon name="phone" className="size-4" />{" "}
                    {courseAttendee.user.telephone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <p>Dokumenty</p>
            <ul className="flex flex-wrap gap-2">
              {/* {courseAttendee.fileUrls.map((url, i) => {
                const fileName =
                  url.split("/").pop()?.split("-").pop() || "File";

                return (
                  <li
                    key={i}
                    className="overflow-hidden text-ellipsis max-w-64"
                  >
                    <Link
                      className="text-primary dark:text-primary hover:underline"
                      href={`/minio?bucketName=courses&url=${url}`}
                    >
                      {fileName}
                    </Link>
                  </li>
                );
              })} */}
              {/* {application.organizationFeedbackUrl && (
                <li>
                  <Link
                    className="text-primary dark:text-primary hover:underline"
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
