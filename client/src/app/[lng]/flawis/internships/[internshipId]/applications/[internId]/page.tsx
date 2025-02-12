import Button from "@/components/Button";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Status } from "@/lib/graphql/generated/graphql";
import ChangeStatusDialog from "./ChangeStatusDialog";
import { Application } from "@/app/[lng]/internships/[internshipId]/Application";
import DeleteApplicationDialog from "@/app/[lng]/internships/[internshipId]/DeleteApplicationDialog";
import { getIntern } from "@/app/[lng]/internships/[internshipId]/applications/[internId]/actions";

export default async function InternPage({
  params: { internshipId, internId, lng },
}: {
  params: { internshipId: string; internId: string; lng: string };
}) {
  const intern = await getIntern(internId);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        as={Link}
        className="rounded-full h-full p-2 hover:bg-gray-100 hover:text-gray-400 ml-auto"
        href={`/internships/${internshipId}/applications`}
      >
        <XMarkIcon className="size-5" />
      </Button>
      <Application
        lng={lng}
        application={intern}
        controls={
          <div className="flex gap-2">
            <DeleteApplicationDialog internId={intern.id} />

            <ChangeStatusDialog
              status={Status.Eligible}
              disabled={intern.status === Status.Eligible}
            />

            <ChangeStatusDialog
              status={Status.Rejected}
              disabled={intern.status === Status.Rejected}
            />
          </div>
        }
      />
    </div>
  );
}
