import Button from "@/components/Button";
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
import { getIntern } from "@/app/[lng]/internships/[internshipId]/applications/actions";
import DynamicImage from "@/components/DynamicImage";
import { Status } from "@/lib/graphql/generated/graphql";
import ChangeStatusForm from "./ChangeStatusForm";
import { Application } from "@/app/[lng]/internships/[internshipId]/Application";

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
        href={`/internships/${internshipId}/applications`}
      >
        <XMarkIcon className="size-5" />
      </Button>
      <Application
        application={intern}
        controls={
          <div className="flex gap-2">
            <Button
              as={Link}
              href={`/internships/${internshipId}/applications/${internId}/delete`}
              size="icon"
              variant="destructive"
            >
              <TrashIcon className="size-5" />
            </Button>

            <ChangeStatusForm
              status={Status.Eligible}
              disabled={intern.status === Status.Eligible}
            />

            <ChangeStatusForm
              status={Status.Rejected}
              disabled={intern.status === Status.Rejected}
            />
          </div>
        }
      />
    </div>
  );
}
