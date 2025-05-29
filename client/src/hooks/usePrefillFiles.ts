import { fetchFromMinio } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { UseFormSetError, UseFormSetValue } from "react-hook-form";

export default function usePrefillFiles({
  cvUrl,
  avatarUrl,
  fileUrls,
  setError,
  setValue,
}: {
  cvUrl?: string | null;
  avatarUrl?: string | null;
  fileUrls?: string[];
  setError: UseFormSetError<any>;
  setValue: UseFormSetValue<any>;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const files: File[] = [];

        if (cvUrl) {
          const cv = await fetchFromMinio("resumes", cvUrl);
          files.push(cv);
        }

        if (fileUrls?.length) {
          for (const url of fileUrls) {
            const file = await fetchFromMinio("internships", url);
            files.push(file);
          }
        }

        if (files.length > 0) {
          setValue("files", files);
        }

        if (avatarUrl) {
          const avatar = await fetchFromMinio("avatars", avatarUrl);
          setValue("avatar", avatar);
        }

        setLoading(false);
      } catch (err: any) {
        setError("files", { message: err.message });
        setLoading(false);
      }
    }

    fetchFiles();
  }, [cvUrl, avatarUrl, fileUrls, setError, setValue]);

  return loading;
}
