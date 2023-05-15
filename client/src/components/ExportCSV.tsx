import { stringify } from "csv-stringify";
import { useState } from "react";
import { Button } from "semantic-ui-react";

export default function ExportCSV({ data }: { data: any[] }) {
  const [loading, setLoading] = useState(false);

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

  return (
    <Button
      color="green"
      content="CSV Export"
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
    />
  );
}
