import Button from "@/components/Button";
import DynamicImage from "@/components/DynamicImage";
import { ApplicationFragment, Status } from "@/lib/graphql/generated/graphql";
import { displayDate } from "@/utils/helpers";
import {
  EnvelopeIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ReactNode } from "react";

export function Application({
  application,
  controls,
}: {
  application: ApplicationFragment;
  controls: ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg border border-primary-500 bg-primary-100 shadow-sm space-y-3">
      <h2 className="text-xl text-primary-500 font-semibold">Prihlaska</h2>
      <div className="flex flex-wrap gap-6">
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
            <DynamicImage
              src={"https://avatar.iran.liara.run/public"}
              alt="Avatar"
              className="size-12 rounded-full"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
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
            <p>Kontakt:</p>
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
            <p>Prilozene subory:</p>
            <ul className="flex flex-wrap gap-2">
              {application.files.map((url, i) => {
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
            </ul>
          </div>
        </div>
      </div>

      {application.status === Status.Accepted && (
        <a
          className="text-primary-500 hover:underline"
          href="https://flaw.uniba.sk"
          target="_blank"
        >
          Forms spokojnost
        </a>
      )}

      <div className="flex flex-wrap items-end gap-2 justify-between">
        <div className="flex flex-col">
          Stav: {application.status}
          <span className="text-sm">
            Aktualizovane {displayDate(application.updatedAt)}
          </span>
        </div>

        {controls}
      </div>
    </div>
  );
}
