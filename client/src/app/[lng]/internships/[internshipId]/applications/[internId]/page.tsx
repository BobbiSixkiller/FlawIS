import Button from "@/components/Button";
import { getIntern } from "../actions";
import Link from "next/link";
import {
  CheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { displayDate } from "@/utils/helpers";
import { XCircleIcon } from "@heroicons/react/20/solid";

export default async function InternPage({
  params: { internshipId, internId },
}: {
  params: { internshipId: string; internId: string };
}) {
  const intern = await getIntern(internId);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        as={Link}
        className="rounded-full h-full p-2 hover:bg-gray-100 hover:text-gray-400 ml-auto"
        href={`/${internshipId}/applications`}
      >
        <XMarkIcon className="size-5" />
      </Button>
      <div className="p-4 rounded-lg border border-primary-500 bg-primary-100 shadow-sm space-y-3">
        <h2 className="text-xl text-primary-500 font-semibold">Prihlaska</h2>
        <div className="flex flex-wrap gap-6">
          <div className="relative flex items-center gap-x-4">
            <UserIcon className="size-10 rounded-full " />
            <div className="">
              <p className="font-semibold text-gray-900">
                <span className="absolute inset-0" />
                {intern.user.name}
              </p>
              <p className="text-gray-600">{intern.user.studyProgramme}</p>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <p>Kontakt:</p>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <a
                    className="text-primary-500 hover:underline inline-flex gap-1 items-center"
                    href={`mailto:${intern.user.email}`}
                  >
                    <EnvelopeIcon className="size-4" /> {intern.user.email}
                  </a>
                </li>
                <li>
                  <a
                    className="text-primary-500 hover:underline inline-flex gap-1 items-center"
                    href={`tel:${intern.user.telephone}`}
                  >
                    <PhoneIcon className="size-4" /> {intern.user.telephone}
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <p>Prilozene subory:</p>
              <ul className="flex flex-wrap gap-2">
                {intern.files.map((url, i) => {
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

        {/* {internship.myApplication.status === Status.Accepted && (
          <a
            className="text-primary-500 hover:underline"
            href="https://flaw.uniba.sk"
            target="_blank"
          >
            Forms spokojnost
          </a>
        )} */}

        <div className="flex flex-wrap items-end gap-2 justify-between">
          <div className="flex flex-col">
            Stav: {intern.status}
            <span className="text-sm">
              Aktualizovane {displayDate(intern.updatedAt)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button as={Link} href={``} size="icon" variant="destructive">
              <TrashIcon className="size-5" />
            </Button>

            <Button as={Link} href={``} size="icon" variant="positive">
              <CheckIcon className="size-5" />
            </Button>

            <Button as={Link} href={``} size="icon">
              <XCircleIcon className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
