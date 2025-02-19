"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { useDialog } from "@/providers/DialogProvider";
import { InboxArrowDownIcon, PencilIcon } from "@heroicons/react/24/outline";
import ApplicationForm from "./ApplicationForm";
import {
  ApplicationFragment,
  UserFragment,
} from "@/lib/graphql/generated/graphql";

export default function ApplicationDialog({
  user,
  application,
}: {
  user: UserFragment;
  application?: ApplicationFragment;
}) {
  const { openDialog } = useDialog();

  const dialogId = "application-dialog";

  return (
    <div>
      {!application ? (
        <Button
          type="button"
          className="w-full"
          onClick={() => openDialog(dialogId)}
        >
          <InboxArrowDownIcon className="size-5 stroke-2 mr-2" /> Prihlasit
        </Button>
      ) : (
        <Button type="button" size="icon" onClick={() => openDialog(dialogId)}>
          <PencilIcon className="size-5" />
        </Button>
      )}

      <Modal dialogId={dialogId}>
        <ApplicationForm
          dialogId={dialogId}
          user={user}
          application={application}
        />
      </Modal>
    </div>
  );
}
