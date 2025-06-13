"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { deleteIntern } from "./actions";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function DeleteApplicationForm({
  dialogId,
  internId,
}: {
  dialogId: string;
  internId: string;
}) {
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, ["internships", "common"]);

  const [pending, startTransition] = useTransition();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  function handleClick() {
    startTransition(async () => {
      const res = await deleteIntern(internId);

      setMessage(res.message, res.success);

      if (res.success) {
        closeDialog(dialogId);
      }
    });
  }

  return (
    <div className="space-y-6">
      <p>{t("deleteIntern.text")}</p>

      <Button
        className="w-full"
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? <Spinner inverted /> : t("confirm", { ns: "common" })}
      </Button>
    </div>
  );
}
