"use client";

import Button from "@/components/Button";
import { TableCellsIcon } from "@heroicons/react/24/outline";
import { stringify } from "csv-stringify";
import { useState } from "react";

function convertToCSV(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true }, (err, output) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
}

const downloadCSV = (csvString: string) => {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ExportCSV({ data }: { data: any[] }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      color="green"
      loading={loading}
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          const csvString = await convertToCSV(data);
          downloadCSV(csvString);
          setLoading(false);
        } catch (error) {
          console.error("Error generating CSV:", error);
        }
      }}
    >
      <div className="flex items-center gap-2">
        .csv <TableCellsIcon className="size-5" />
      </div>
    </Button>
  );
}
