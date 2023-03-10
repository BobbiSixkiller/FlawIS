import { useTranslation } from "next-i18next";
import {
  array,
  boolean,
  date,
  mixed,
  object,
  ref,
  setLocale,
  string,
} from "yup";

export function checkIfFilesAreTooBig(file: File): boolean {
  console.log(file.size, 10000000);
  return file.size < 10000000; //1MB
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
    password: string().trim().required(),
  });

  const flawisRegisterInputSchema = object({
    name: string().trim().required(),
    email: string()
      .required()
      .email()
      .test(
        "isUniba",
        t("unibaEmail"),
        (val) =>
          val !== undefined &&
          val?.includes("@") &&
          val?.split("@")[1].includes("uniba")
      ),
    password: string()
      .trim()
      .required()
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, t("password")),
    repeatPass: string()
      .trim()
      .required()
      .oneOf([ref("password")], t("passNoMatch")),
  });

  const conferencesRegisterInputSchme = object({
    name: string().trim().required(),
    email: string().required().email(),
    password: string()
      .trim()
      .required()
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, t("password")),
    repeatPass: string()
      .trim()
      .required()
      .oneOf([ref("password")], t("passNoMatch")),
    organisation: string().trim().required(),
    telephone: string().trim().required(),
    terms: boolean().oneOf([true], t("terms")).required(),
  });

  const forgotPasswordInputSchema = object({
    email: string().required().email(),
  });

  const passwordInputSchema = object({
    password: string()
      .trim()
      .required()
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, t("password")),
    repeatPass: string()
      .trim()
      .required()
      .oneOf([ref("password")], t("passNoMatch")),
  });

  const perosnalInfoInputSchema = object({
    name: string().trim().required(),
    email: string().required().email(),
    organisation: string().trim().required(),
    telephone: string().trim().required(),
  });

  const conferenceInputSchema = object({
    name: string().trim().required(),
    slug: string().trim().required(),
    description: string().trim().required(),
    dates: object({
      start: date().required(),
      end: date()
        .min(ref("start"), "end date can't be before start date")
        .required(),
    }),
    files: array()
      .of(
        mixed()
          .test(
            "is-correct-file",
            "VALIDATION_FIELD_FILE_BIG",
            checkIfFilesAreTooBig
          )
          .test(
            "is-big-file",
            "VALIDATION_FIELD_FILE_WRONG_TYPE",
            checkIfFilesAreCorrectType
          )
      )
      .test({
        message: "Pole musí obsahovať presne 3 súbory",
        test: (arr) => arr?.length === 3,
      }),
  });

  const conferenceInvoiceInputSchema = object({
    billing: object({
      name: string().trim().required(),
      address: object({
        street: string().trim().required(),
        city: string().trim().required(),
        postal: string().trim().required(),
        country: string().trim().required(),
      }),
      variableSymbol: string().trim().required(),
      IBAN: string().trim().required(),
      SWIFT: string().trim().required(),
      ICO: string().trim().required(),
      DIC: string().trim().required(),
      ICDPH: string().trim().required(),
    }),
  });

  return {
    loginInputSchema,
    flawisRegisterInputSchema,
    conferencesRegisterInputSchme,
    forgotPasswordInputSchema,
    passwordInputSchema,
    perosnalInfoInputSchema,
    conferenceInputSchema,
    conferenceInvoiceInputSchema,
  };
}
