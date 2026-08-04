"use client";

import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { InvoiceOwnerType } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useMessageStore } from "@/stores/messageStore";

function filenameFromHeaders(response: Response) {
  const disposition = response.headers.get("content-disposition");
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || "invoice.pdf";
}

export default function DownloadInvoiceButton({
  attendeeId,
  lng,
  ownerType,
}: {
  attendeeId: string;
  lng: string;
  ownerType: InvoiceOwnerType;
}) {
  const { t } = useTranslation(lng, "invoice");
  const setMessage = useMessageStore((state) => state.setMessage);
  const [isPending, startTransition] = useTransition();

  const download = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/${lng}/invoice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendeeId, ownerType }),
        });

        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(result?.message || t("downloadError"));
        }

        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = url;
        link.download = filenameFromHeaders(response);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : t("downloadError"),
          false,
        );
      }
    });
  };

  return (
    <Button
      aria-busy={isPending}
      disabled={isPending}
      onClick={download}
      size="sm"
      variant="secondary"
    >
      {isPending ? (
        <Spinner />
      ) : (
        <DocumentArrowDownIcon className="size-5" />
      )}
      {isPending ? t("loading") : t("download")}
    </Button>
  );
}
