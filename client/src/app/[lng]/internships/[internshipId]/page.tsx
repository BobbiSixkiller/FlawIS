import Button from "@/components/Button";
import {
  EnvelopeIcon,
  InboxArrowDownIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { getInternship } from "./actions";
import { redirect } from "next/navigation";
import { getMe } from "../../(auth)/actions";
import { Access, Status } from "@/lib/graphql/generated/graphql";
import { displayDate } from "@/utils/helpers";
import DynamicImage from "@/components/DynamicImage";

export default async function InternshipPage({
  params: { internshipId },
}: {
  params: { internshipId: string };
}) {
  const [internship, user] = await Promise.all([
    getInternship(internshipId),
    getMe(),
  ]);
  if (!internship) {
    redirect("/");
  }

  const showControls =
    user.access.includes(Access.Admin) ||
    user.access.includes(Access.Organization);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        {showControls && (
          <>
            <Button
              scroll={false}
              variant="secondary"
              as={Link}
              className="rounded-full h-full p-2"
              href={`/${internshipId}/update`}
            >
              <PencilIcon className="size-5" />
            </Button>
            <Button
              scroll={false}
              variant="destructive"
              as={Link}
              className="rounded-full h-full p-2 mr-auto"
              href={`/${internshipId}/delete`}
            >
              <TrashIcon className="size-5" />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          as={Link}
          className="rounded-full h-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
          href={`/`}
        >
          <XMarkIcon className="size-5" />
        </Button>
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: internship.description }}
      />

      {user.access.includes(Access.Student) ? (
        internship.myApplication ? (
          <>
            <div className="border-t" />
            <div className="p-4 rounded-lg border border-primary-500 bg-primary-100 shadow-sm space-y-3">
              <h2 className="text-xl text-primary-500 font-semibold">
                Prihlaska
              </h2>
              <div className="flex flex-wrap gap-6">
                <div className="relative flex items-center gap-x-4">
                  {internship.myApplication.user.avatarUrl ? (
                    <DynamicImage
                      alt="avatar"
                      src={internship.myApplication.user.avatarUrl}
                      className="w-[60px] h-[60px] rounded-full"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <UserIcon className="size-10 rounded-full " />
                  )}
                  <div className="">
                    <p className="font-semibold text-gray-900">
                      <span className="absolute inset-0" />
                      {internship.myApplication.user.name}
                    </p>
                    <p className="text-gray-600">
                      {internship.myApplication.user.studyProgramme}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    <p>Kontakt:</p>
                    <ul className="flex flex-wrap gap-2">
                      <li>
                        <a
                          className="text-primary-500 hover:underline inline-flex gap-1 items-center"
                          href={`mailto:${internship.myApplication.user.email}`}
                        >
                          <EnvelopeIcon className="size-4" />{" "}
                          {internship.myApplication.user.email}
                        </a>
                      </li>
                      <li>
                        <a
                          className="text-primary-500 hover:underline inline-flex gap-1 items-center"
                          href={`tel:${internship.myApplication.user.telephone}`}
                        >
                          <PhoneIcon className="size-4" />{" "}
                          {internship.myApplication.user.telephone}
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <p>Prilozene subory:</p>
                    <ul className="flex flex-wrap gap-2">
                      {internship.myApplication.files.map((url, i) => {
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

              {internship.myApplication.status === Status.Accepted && (
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
                  Stav: {internship.myApplication.status}
                  <span className="text-sm">
                    Aktualizovane {displayDate(internship.updatedAt)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {internship.myApplication.status === Status.Applied && (
                    <Button
                      as={Link}
                      href={`/${internshipId}/application`}
                      size="icon"
                    >
                      <PencilIcon className="size-5" />
                    </Button>
                  )}

                  {internship.myApplication.status !== Status.Accepted && (
                    <Button
                      as={Link}
                      href={`/${internshipId}/application/delete`}
                      size="icon"
                      variant="destructive"
                    >
                      <TrashIcon className="size-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center rounded-lg p-4 border border-orange-300 bg-orange-100 text-orange-500">
              Pred prihlasenim si prosim skontrolujte{" "}
              <Link
                className="font-semibold hover:underline"
                href={"/profile/update"}
                scroll={false}
              >
                osobne udaje
              </Link>
              .
            </div>
            <Button
              type="button"
              className="w-full"
              as={Link}
              href={`/${internshipId}/application`}
            >
              <InboxArrowDownIcon className="size-5 stroke-2 mr-2" /> Prihlasit
            </Button>
          </>
        )
      ) : null}
    </div>
  );
}
