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
import DynamicImage from "@/components/DynamicImage";
import ChangeStatusForm from "@/app/[lng]/flawis/internships/[internshipId]/applications/[internId]/ChangeStatusForm";
import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "../../Application";

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
      <Application
        application={intern}
        controls={
          <div className="flex gap-2">
            <ChangeStatusForm
              status={Status.Accepted}
              disabled={intern.status === Status.Accepted}
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
