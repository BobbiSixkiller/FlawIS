"use client";

import React, { useTransition } from "react";
import Button from "@/components/Button";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/lib/i18n/client";
import { AttendeeFragment } from "@/lib/graphql/generated/graphql";

interface DownloadPDFButtonProps {
  lng: string;
  data: AttendeeFragment;
}

const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ lng, data }) => {
  const { t } = useTranslation(lng, "invoice");

  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    startTransition(async () => {
      const response = await fetch(`/${lng}/invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Invoice.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    });
  };

  return (
    <div className="max-w-56">
      <Button
        fluid
        color="red"
        loading={isPending}
        loadingText={t("loading")}
        onClick={handleDownload}
      >
        <DocumentIcon className="h-5 w-5 mr-2" />
        {t("download")}
      </Button>
    </div>
  );
};

export default DownloadPDFButton;