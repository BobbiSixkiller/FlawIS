"use server";

import { TypedDocumentString } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n";
import { cookieName, fallbackLng } from "@/lib/i18n/settings";
import { GraphQLError } from "graphql";
import { IncomingHttpHeaders } from "http";
import { cookies, headers } from "next/headers";
import { boolean, object, ref, setLocale, string } from "yup";

type GraphQLResponse<GraphQLData> = {
  data: GraphQLData;
  errors?: GraphQLError[];
};

export async function executeGqlFetch<Data, Variables>(
  document: TypedDocumentString<Data, Variables>,
  variables?: Variables,
  customHeaders: IncomingHttpHeaders | null = null,
  next?: NextFetchRequestConfig,
  nextCache?: RequestCache
): Promise<GraphQLResponse<Data>> {
  const res = await fetch("http://core:5000/graphql", {
    cache: nextCache,
    next,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      //this needs staging testing whether it appends actual browser IP or just docker container
      "x-forwarded-for": headers().get("x-forwarded-for")?.toString() as string,
      origin:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://flawis.flaw.uniba.sk",
      Cookie: cookies()
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join(";"),
      ...(customHeaders as HeadersInit),
    },
    body: JSON.stringify({ query: document.toString(), variables }),
  });
  return (await res.json()) as GraphQLResponse<Data>;
}

export async function validation() {
  const locale = cookies().get(cookieName)?.value || fallbackLng;
  // eslint-disable-next-line no-console, react-hooks/rules-of-hooks
  const { t } = await useTranslation(locale, "validation");

  setLocale({
    mixed: {
      required: t("required"),
    },
    string: {
      email: t("email"),
    },
  });

  const registerInputSchema = object({
    name: string().trim().required(),
    email: string().required().email(),
    password: string()
      .trim()
      .required()
      .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).{6,20}$/, t("password")),
    confirmPassword: string()
      .trim()
      .required()
      .oneOf([ref("password")], t("confirmPass")),
    organization: string().trim().required(),
    telephone: string().trim().required(),
    privacy: boolean().oneOf([true], t("privacy")).required(),
    url: string(),
  });

  const profileInputSchema = object({
    id: string().required(),
    name: string().trim().required(),
    email: string().required().email(),
    organization: string().trim().required(),
    telephone: string().trim().required(),
  });

  const userInputSchema = profileInputSchema.concat(
    object({
      role: string().oneOf(["Basic", "Admin"], t("role")),
      verified: boolean(),
    })
  );

  const loginValidationSchema = object({
    email: string().required().email(),
    password: string().trim().required(),
    url: string(),
  });

  const forgotPasswordValidationSchema = object({
    email: string().required().email(),
  });

  const resetPasswordValidationSchema = object({
    password: string()
      .trim()
      .required()
      .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).{6,20}$/, t("password")),
    confirmPassword: string()
      .trim()
      .required()
      .oneOf([ref("password")], t("confirmPass")),
    token: string().trim().required(),
  });

  return {
    registerInputSchema,
    loginValidationSchema,
    forgotPasswordValidationSchema,
    resetPasswordValidationSchema,
    profileInputSchema,
    userInputSchema,
  };
}
