"use client";

import { useTransition } from "react";
import Button from "./Button";
import Spinner from "./Spinner";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { GqlMutationResponse } from "@/utils/actions";

interface ConfirmDeleteFormProps<TData> {
  text: string;
  dialogId: string;
  action: () => Promise<GqlMutationResponse<TData>>;
}

export default function ConfirmDeleteForm<TData>({
  text,
  action,
  dialogId,
}: ConfirmDeleteFormProps<TData>) {
  const [isPending, startTransition] = useTransition();
  const { lng } = useParams<{ lng: string }>();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const { t } = useTranslation(lng, "common");

  return (
    <form
      className="space-y-6 w-full max-w-sm"
      action={() =>
        startTransition(async () => {
          const res = await action();

          setMessage(res.message, res.success);

          if (res.success) {
            closeDialog(dialogId);
          }
        })
      }
    >
      <p>{text}</p>
      <Button
        variant="destructive"
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? <Spinner /> : t("confirm")}
      </Button>
    </form>
  );
}
