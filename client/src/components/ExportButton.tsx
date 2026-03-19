"use client";

import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useMessageStore } from "@/stores/messageStore";
import { TableCellsIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function ExportButton({ fetchUrl }: { fetchUrl: string }) {
  const [loading, setLoading] = useState(false);
  const setMessage = useMessageStore((s) => s.setMessage);

  async function handleClick() {
    setLoading(true);

    try {
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;

      const disposition = response.headers.get("Content-Disposition");
      let filename = "export.csv";
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/['"]/g, "");
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up the anchor element and URL object
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.log(error);
      setMessage(error.message, false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} size="sm" variant="positive" className="w-20">
      {loading ? (
        <Spinner inverted />
      ) : (
        <span className="flex gap-2 items-center">
          .csv <TableCellsIcon className="size-5" />
        </span>
      )}
    </Button>
  );
}
