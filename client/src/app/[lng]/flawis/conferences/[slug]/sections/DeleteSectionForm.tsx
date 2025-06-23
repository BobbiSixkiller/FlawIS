"use client";

import { SectionFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { deleteSection } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useTransition } from "react";
import Spinner from "@/components/Spinner";

export default function DeleteSectionForm({
  section,
  lng,
  dialogId,
}: {
  section: SectionFragment;
  lng: string;
  dialogId: string;
}) {
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-6 min-w-80"
      action={() =>
        startTransition(async () => {
          const res = await deleteSection({ id: section.id });

          setMessage(res.message, res.success);

          if (res.success) {
            closeDialog(dialogId);
          }
        })
      }
    >
      <input type="hidden" name="id" value={section.id} />

      <h1>
        Naozaj chcete zmazat sekciu{" "}
        {section?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button
        disabled={pending}
        color="primary"
        type="submit"
        className="w-full"
      >
        {pending ? <Spinner inverted /> : "Potvrdit"}
      </Button>
    </form>
  );
}
