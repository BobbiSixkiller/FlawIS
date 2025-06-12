"use client";

import { SectionFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { deleteSection } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

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

  return (
    <form
      className="space-y-6 min-w-80"
      action={async (data) => {
        const state = await deleteSection(null, data);

        setMessage(state.message, state.success);

        if (state.success) {
          closeDialog(dialogId);
        }
      }}
    >
      <input type="hidden" name="id" value={section.id} />

      <h1>
        Naozaj chcete zmazat sekciu{" "}
        {section?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button color="primary" type="submit" className="w-full">
        Potvrdit
      </Button>
    </form>
  );
}
