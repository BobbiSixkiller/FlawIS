import { Status } from "@/lib/graphql/generated/graphql";
import ChangeStatusDialog from "./ChangeStatusDialog";
import { Application } from "@/app/[lng]/internships/[internshipId]/Application";
import DeleteApplicationDialog from "@/app/[lng]/internships/[internshipId]/DeleteApplicationDialog";
import { getIntern } from "@/app/[lng]/internships/[internshipId]/applications/[internId]/actions";
import CloseButton from "@/components/CloseButton";

export default async function InternPage({
  params: { internshipId, internId, lng },
}: {
  params: { internshipId: string; internId: string; lng: string };
}) {
  const intern = await getIntern(internId);

  return (
    <div className="flex flex-col gap-6">
      <CloseButton href={`/internships/${internshipId}/applications`} />

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
