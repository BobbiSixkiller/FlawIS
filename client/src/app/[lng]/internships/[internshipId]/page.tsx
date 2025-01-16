import Button from "@/components/Button";
import {
  InboxArrowDownIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { getInternship } from "./actions";
import { redirect } from "next/navigation";
import { getMe } from "../../(auth)/actions";
import { Access, Status } from "@/lib/graphql/generated/graphql";
import { Application } from "./Application";

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
            <Application
              application={internship.myApplication}
              controls={
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
              }
            />
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
