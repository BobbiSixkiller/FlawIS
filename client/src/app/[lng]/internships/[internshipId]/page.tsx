import Button from "@/components/Button";
import {
  InboxArrowDownIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { getInternship } from "./actions";
import { redirect } from "next/navigation";
import { getMe } from "../../(auth)/actions";
import { Access, Status } from "@/lib/graphql/generated/graphql";
import { Application } from "./Application";
import InternshipDialog from "../InternshipDialog";
import DeleteInternshipDialog from "./DeleteInternshipDialog";
import DeleteApplicationDialog from "./DeleteApplicationDialog";

export default async function InternshipPage({
  params: { internshipId, lng },
}: {
  params: { internshipId: string; lng: string };
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
      <div className="flex gap-2">
        {showControls && (
          <>
            <InternshipDialog data={internship} />
            <DeleteInternshipDialog />
          </>
        )}

        <Button
          variant="ghost"
          as={Link}
          className="rounded-full h-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400 ml-auto"
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
              lng={lng}
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
                    <DeleteApplicationDialog
                      internId={internship.myApplication.id}
                    />
                    // <Button
                    //   as={Link}
                    //   href={`/${internshipId}/application/delete`}
                    //   size="icon"
                    //   variant="destructive"
                    // >
                    //   <TrashIcon className="size-5" />
                    // </Button>
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
