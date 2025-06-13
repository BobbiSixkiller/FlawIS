"use client";

import { Status } from "@/lib/graphql/generated/graphql";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { changeInternStatus } from "./actions";
import { useTranslation } from "@/lib/i18n/client";
import { useMessageStore } from "@/stores/messageStore";
import { useDialogStore } from "@/stores/dialogStore";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function ChangeStatusForm({
  dialogId,
  status,
}: {
  status: Status;
  dialogId: string;
}) {
  const { internId, lng } = useParams<{ internId: string; lng: string }>();
  const [pending, startTransition] = useTransition();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const handleClick = () =>
    startTransition(async () => {
      const res = await changeInternStatus({ id: internId, status });

      setMessage(res.message, res.success);

      if (res.success) {
        closeDialog(dialogId);
      }
    });

  const { t } = useTranslation(lng, ["internships", "common"]);

  return (
    <div className="space-y-6">
      <p>{t("statusChange.body", { ns: "internships", status: t(status) })}</p>

      <Button
        className="w-full"
        type="button"
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? <Spinner inverted /> : t("confirm", { ns: "common" })}
      </Button>
    </div>
  );
}
