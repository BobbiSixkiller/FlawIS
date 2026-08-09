import {
  AcademicCapIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import { ElearningProvisioningStatus } from "@/lib/graphql/generated/graphql";

type ElearningAccessValue = {
  status: ElearningProvisioningStatus;
  launchUrl?: string | null;
};

function ElearningStatus({ access }: { access: ElearningAccessValue }) {
  if (
    access.status === ElearningProvisioningStatus.Enrolled &&
    access.launchUrl
  ) {
    return (
      <Button
        as="a"
        href={access.launchUrl}
        target="_blank"
        rel="noreferrer"
        variant="positive"
      >
        <AcademicCapIcon className="size-5" />
        Otvoriť e-learning
      </Button>
    );
  }

  if (access.status === ElearningProvisioningStatus.PendingInvitation) {
    return (
      <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200">
        <p className="flex items-center gap-2 font-medium">
          <EnvelopeIcon className="size-5" />
          Skontrolujte si e-mail a prijmite pozvánku do Reach 360.
        </p>
      </div>
    );
  }

  if (access.status === ElearningProvisioningStatus.SyncFailed) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
        <p className="flex items-center gap-2 font-medium">
          <ExclamationCircleIcon className="size-5 shrink-0" />
          E-learningový prístup sa nepodarilo pripraviť. Kontaktujte správcu
          kurzu.
        </p>
      </div>
    );
  }

  return null;
}

export default function ElearningAccess({
  access,
}: {
  access?: ElearningAccessValue | null;
}) {
  if (!access) {
    return null;
  }

  return <ElearningStatus access={access} />;
}
