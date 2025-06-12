"use client";

import { useContext, useTransition } from "react";
import { SubmissionFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { useTranslation } from "@/lib/i18n/client";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { deleteSubmission } from "./actions";
import { useMessageStore } from "@/stores/messageStore";

export default function DeleteSubmissionForm({
  submission,
  lng,
  dialogId,
}: {
  submission: SubmissionFragment;
  lng: string;
  dialogId: string;
}) {
  const { t } = useTranslation(lng, "common");

  const [pending, startTransition] = useTransition();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  function handleClick() {
    startTransition(async () => {
      const state = await deleteSubmission(submission.id);

      setMessage(state.message, state.success);

      if (state.success) {
        closeDialog(dialogId);
      }
    });
  }

  return (
    <div className="space-y-6 w-80 sm:w-96">
      <h1>
        {t("deleteConfirm", {
          name: submission.translations[lng as "sk" | "en"]?.name,
        })}
      </h1>

      <Button
        color="primary"
        type="button"
        className="w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? <Spinner inverted /> : t("confirm")}
      </Button>
    </div>
  );
}
