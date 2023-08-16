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
      .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).{6,20}$/, t("password")),
    repeatPass: string()
      .trim()
      .required()
      .oneOf([ref("password")], t("passNoMatch")),
  });

  const conferencesRegisterInputSchema = object({
    titlesBefore: string().trim().required(),
    name: string().trim().required(),
    titlesAfter: string().trim().nullable(),
    email: string().required().email(),
    password: string()
      .trim()
      .required()
      .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).{6,20}$/, t("password")),
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
      .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).{6,20}$/, t("password")),
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
    titlesBefore: string().trim().required(),
    titlesAfter: string().trim().nullable(),
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
      ICO: string().trim(),
      DIC: string().trim(),
      ICDPH: string().trim(),
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
      ICO: string().trim(),
      DIC: string().trim(),
      ICDPH: string().trim(),
    }),
  });

  const ticketInputSchema = object({
    ticketId: string().required(),
  });

  const submissionInputSchema = object({
    submission: object({
      conferenceId: string().required(),
      sectionId: string().required(),
      userId: string(),
      name: string().trim().required(),
      abstract: string().trim().required(),
      keywords: array()
        .of(string().required().trim())
        .min(1, t("keywords"))
        .required(),
      authors: array().of(string().email().required()).required(),
      translations: array()
        .of(
          object({
            language: string().required(),
            name: string().required().trim(),
            abstract: string().required().trim(),
            keywords: array()
              .of(string().required().trim())
              .min(1, t("keywords"))
              .required(),
          })
        )
        .required(),
    }),
  });

  const submissionFileSchema = object({
    files: array()
      .required()
      .test({
        message: t("file"),
        test: (arr) => arr?.length === 1,
      }),
  });

  return {
    loginInputSchema,
    flawisRegisterInputSchema,
    conferencesRegisterInputSchema,
    forgotPasswordInputSchema,
    passwordInputSchema,
    perosnalInfoInputSchema,
    conferenceInputSchema,
    conferenceInvoiceInputSchema,
    attendeeBillingInputSchema,
    ticketInputSchema,
    submissionInputSchema,
    submissionFileSchema,
  };
}
