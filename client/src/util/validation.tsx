import { useTranslation } from "next-i18next";
import { object, setLocale, string } from "yup";

export function checkIfFilesAreTooBig(file: File): boolean {
  return file.size < 1000000; //1MB
}

export function checkIfFilesAreCorrectType(file: File): boolean {
  return [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ].includes(file.type);
}

export default function Validation() {
  const { t } = useTranslation("validation");

  setLocale({
    mixed: {
      required: t("required"),
    },
    string: {
      email: t("email"),
    },
  });

  const loginInputSchema = object({
    email: string().email().required(),
    password: string().required(),
  });

  const perosnalInfoInputSchema = object({
    name: string().required(),
    email: string().required().email(),
    organisation: string().required(),
  });

  return { loginInputSchema, perosnalInfoInputSchema };
}
