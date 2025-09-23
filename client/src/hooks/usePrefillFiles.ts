import { fetchFromMinio } from "@/utils/helpers";
import { useEffect, useState } from "react";

type FileSources = Record<string, string | string[] | null | undefined>;

export default function usePrefillFiles(fileSources: FileSources) {
  const [loading, setLoading] = useState(
    Object.values(fileSources).some(Boolean)
  );
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchFiles() {
      const loadedFiles: Record<string, File[]> = {};
      const collectedErrors: Record<string, string> = {};

      await Promise.all(
        Object.entries(fileSources).map(async ([bucket, urls]) => {
          if (!urls) return;

          try {
            const urlsArray = Array.isArray(urls) ? urls : [urls];
            const bucketFiles: File[] = [];

            for (const url of urlsArray) {
              const file = await fetchFromMinio(bucket, url);
              bucketFiles.push(file);
            }

            if (bucketFiles.length) {
              loadedFiles[bucket] = bucketFiles;
            }
          } catch (err: any) {
            collectedErrors[bucket] = err?.message || "Failed to fetch file(s)";
          }
        })
      );

      setFiles(loadedFiles);
      setErrors(collectedErrors);
      setLoading(false);
    }

    fetchFiles();
  }, [JSON.stringify(fileSources)]); // stringify to detect deep changes

  return { loading, files, errors };
}
