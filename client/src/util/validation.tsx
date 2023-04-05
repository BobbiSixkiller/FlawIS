import { useTranslation } from "next-i18next";
import { array, boolean, date, object, ref, setLocale, string } from "yup";

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
    files: array().test({
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

  const attendeeBillingInputSchema = object({
    billing: object({
      name: string().trim().required(),
      address: object({
        street: string().trim().required(),
        city: string().trim().required(),
        postal: string().trim().required(),
        country: string().trim().required(),
      }),
      ICO: string().trim().required(),
      DIC: string().trim().required(),
      ICDPH: string().trim().required(),
    }),
  });

  const ticketInputSchema = object({
    ticketId: string().required(),
  });

  const submissionInputSchema = object({
    submission: object({
      sectionId: string().required(),
      name: string().trim().required(),
      abstract: string().trim().required(),
      keywords: array().of(string().trim()).min(1, t("keywords")),
      authors: array().of(string().email()),
      translations: array().of(
        object({
          language: string(),
          name: string().trim().required(),
          abstract: string().trim().required(),
          keywords: array().of(string().trim()).min(1, t("keywords")),
        })
      ),
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
    attendeeBillingInputSchema,
    ticketInputSchema,
    submissionInputSchema,
  };
}
