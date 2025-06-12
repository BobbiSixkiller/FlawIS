"use client";

import { useTransition } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { impersonate } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function ImpersonateForm({
  user,
  dialogId,
}: {
  user: Pick<UserFragment, "id" | "name">;
  lng: string;
  dialogId: string;
}) {
  const [pending, startTransition] = useTransition();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  function handleClick() {
    startTransition(async () => {
      const res = await impersonate(user.id);

      setMessage(res.message, res.success);

      if (res.success) {
        closeDialog(dialogId);
      }
    });
  }

  return (
    <div className="space-y-6 mt-4 sm:w-96 mx-auto">
      <h1>Prihlasit sa ako {user.name} ?</h1>

      <Button
        color="primary"
        type="submit"
        className="w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? <Spinner inverted /> : "Potvridt"}
      </Button>
    </div>
  );
}
