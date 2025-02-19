"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { useDialog } from "@/providers/DialogProvider";
import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import InternshipForm from "./InternshipForm";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export default function InternshipDialog({
  data,
}: {
  data?: { id: string; description: string };
}) {
  const dialogId = data ? "update-internship" : "create-internship";
  const { lng } = useParams<{ lng: string }>();

  const { openDialog } = useDialog();

  const { t } = useTranslation(lng, ["internships", "common"]);

  return (
    <div>
      {data ? (
        <Button
          type="button"
          onClick={() => openDialog(dialogId)}
          className="rounded-full h-full p-2"
        >
          <PencilIcon className="size-5" />
        </Button>
      ) : (
        <Button size="sm" type="button" onClick={() => openDialog(dialogId)}>
          <PlusIcon className="size-5 mr-2" />
          {t("create", { ns: "common" })}
        </Button>
      )}

      <Modal title={data ? t("update") : t("new")} dialogId={dialogId}>
        <InternshipForm data={data} />
      </Modal>
    </div>
  );
}
