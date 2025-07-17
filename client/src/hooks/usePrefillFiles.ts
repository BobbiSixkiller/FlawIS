import { fetchFromMinio } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { UseFormSetError, UseFormSetValue } from "react-hook-form";

export default function usePrefillFiles({
  cvUrl,
  avatarUrl,
  fileUrls,
}: {
  cvUrl?: string | null;
  avatarUrl?: string | null;
  fileUrls?: string[];
}) {
  const [loading, setLoading] = useState(
    cvUrl || fileUrls || avatarUrl ? true : false
  );
  const [files, setFiles] = useState<File[]>([]);
  const [avatar, setAvatar] = useState<File>();
  const [errors, setErrors] = useState<Record<string, string>>();

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
          setFiles(files);
        }
      } catch (error: any) {
        setErrors((prev) => ({ ...prev, files: error.message }));
      }

      try {
        if (avatarUrl) {
          const avatar = await fetchFromMinio("avatars", avatarUrl);
          setAvatar(avatar);
        }
      } catch (error: any) {
        setErrors((prev) => ({ ...prev, avatar: error.message }));
      }

      setLoading(false);
    }

    fetchFiles();
  }, [cvUrl, avatarUrl, fileUrls]);

  return { loading, errors, files, avatar };
}
