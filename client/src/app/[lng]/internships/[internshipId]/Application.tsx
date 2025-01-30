import DynamicImage from "@/components/DynamicImage";
import { ApplicationFragment, Status } from "@/lib/graphql/generated/graphql";
import { translate } from "@/lib/i18n";
import { displayDate } from "@/utils/helpers";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ReactNode } from "react";

export async function Application({
  application,
  controls,
  lng,
}: {
  application: ApplicationFragment;
  controls: ReactNode;
  lng: string;
}) {
  const { t } = await translate(lng, ["internships", "common"]);

  return (
    <div className="p-4 rounded-lg border border-primary-500 bg-primary-100 shadow-sm space-y-3">
      <h2 className="text-xl text-primary-500 font-semibold">
        {t("application")}
      </h2>

      <div className="flex items-center flex-wrap gap-6">
        <div className="relative flex items-center gap-x-4">
          {application.user.avatarUrl ? (
            <DynamicImage
              alt="avatar"
              src={application.user.avatarUrl}
              className="w-[60px] h-[60px] rounded-full"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="size-12 rounded-full text-2xl flex justify-center items-center bg-primary-300 text-white">
              {application.user.name
                .split(" ")
                .map((n, i) => {
                  if (i < 2) return n[0].toUpperCase();
                })
                .join("")}
            </div>
          )}
          <div className="">
            <p className="font-semibold text-gray-900">
              <span className="absolute inset-0" />
              {application.user.name}
            </p>
            <p className="text-gray-600">{application.user.studyProgramme}</p>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <p>{t("contact")}:</p>
            <ul className="flex flex-wrap gap-2">
              <li>
                <a
                  className="text-primary-500 hover:underline inline-flex gap-1 items-center"
                  href={`mailto:${application.user.email}`}
                >
                  <EnvelopeIcon className="size-4" /> {application.user.email}
                </a>
              </li>
              <li>
                <a
                  className="text-primary-500 hover:underline inline-flex gap-1 items-center"
                  href={`tel:${application.user.telephone}`}
                >
                  <PhoneIcon className="size-4" /> {application.user.telephone}
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <p>{t("address", { ns: "common" })}:</p>
            <p>{Object.values(application.user.address).join(", ")}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <p>{t("files")}</p>
            <ul className="flex flex-wrap gap-2">
              {application.fileUrls.map((url, i) => {
                const fileName =
                  url.split("/").pop()?.split("-").pop() || "File";

                return (
                  <li key={i}>
                    <Link
                      className="text-primary-500 hover:underline"
                      href={`/minio?bucketName=internships&url=${url}`}
                    >
                      {fileName}
                    </Link>
                  </li>
                );
              })}
              {application.organizationFeedbackUrl && (
                <li>
                  <Link
                    className="text-primary-500 hover:underline"
                    href={`/minio?bucketName=internships&url=${application.organizationFeedbackUrl}`}
                  >
                    {application.organizationFeedbackUrl
                      .split("/")
                      .pop()
                      ?.split("-")
                      .pop() || "File"}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 justify-between">
        <div className="flex flex-col">
          Status: {t(application.status.toUpperCase())}
          <span className="text-sm">
            {t("updatedAt", {
              ns: "common",
              value: displayDate(application.updatedAt, lng),
            })}
          </span>
        </div>

        {controls}
      </div>
    </div>
  );
}
