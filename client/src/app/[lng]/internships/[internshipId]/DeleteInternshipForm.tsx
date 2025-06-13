"use client";

import Button from "@/components/Button";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import Spinner from "@/components/Spinner";
import { deleteInternship } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function DeleteInternshipForm({
  dialogId,
}: {
  dialogId: string;
}) {
  const { internshipId, lng } = useParams<{
    internshipId: string;
    lng: string;
  }>();
  const [pending, startTransition] = useTransition();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const handleClick = () =>
    startTransition(async () => {
      const res = await deleteInternship(internshipId);

      setMessage(res.message, res.success);

      if (res.success) {
        closeDialog(dialogId);
      }
    });

  const { t } = useTranslation(lng, ["internships", "common"]);

  return (
    <div className="space-y-6">
      <p>{t("delete.text")}</p>

      <Button
        className="w-full"
        type="button"
        disabled={pending}
        onClick={handleClick}
        variant="destructive"
      >
        {pending ? <Spinner inverted /> : t("confirm", { ns: "common" })}
      </Button>
    </div>
  );
}
