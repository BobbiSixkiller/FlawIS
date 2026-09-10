import { validation } from "@/lib/validation/form-validation";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function useValidation() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "validation");
  const v = useMemo(() => validation(t), [t]);
  return { v };
}
