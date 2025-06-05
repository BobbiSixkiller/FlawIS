"use client";

import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { TableCellsIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ExportButton() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const response = await fetch(`/conferences/${slug}/attendees/export`);

      if (!response.ok) {
        throw new Error("Failed to download the file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-export.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up the anchor element and URL object
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
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
