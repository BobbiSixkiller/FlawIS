import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import * as yup from "yup";

export default function useValidation() {
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, "validation");

  yup.setLocale({
    mixed: {
      required: t("required"),
    },
    string: {
      email: t("email"),
    },
  });

  return { yup };
}
