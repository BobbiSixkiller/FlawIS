import type { TFunction } from "i18next";
import { z } from "zod";
import { validation } from "./form-validation";
import { Access, StudyProgramme } from "../graphql/generated/graphql";
import { parsePhone } from "../phone";

const LETTERS = "A-Za-zÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáäčďéíĺľňóôŕšťúýž";
const PART = `[${LETTERS}]+(?:-[${LETTERS}]+)*`;
const FULL_NAME = new RegExp(`^${PART}(?:\\s+${PART})+$`);
const TITLES =
  /(?:^|\s)(?:Bc|Mgr|Ing|JUDr|MUDr|MVDr|MDDr|PhDr|RNDr|PaedDr|PharmDr|ThDr|ThLic|doc|prof|Dr|PhD|ArtD|CSc|DrSc|MBA|LL\.?M|MSc|MA|BA)\.?(?=\s|$|,)/i;
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;
const UNIBA_EMAIL =
  /^[a-zA-Z0-9._%+-]+@(?:([a-zA-Z0-9-]+\.)*uniba\.sk|([a-zA-Z0-9-]+\.)*student\.euba\.sk)$/;
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

export function createUserFormSchema(
  t: TFunction<"validation">,
  options: {
    profile: boolean;
    requireUniversityEmail: boolean;
    student: boolean;
    requirePhone: boolean;
    requireCv: boolean;
    registering: boolean;
  },
) {
  const v = validation(t);
  const addressField = () =>
    options.student
      ? v.string().trim().min(1, v.required)
      : v.string().optional();
  const password = options.profile
    ? v
        .string()
        .trim()
        .refine((value) => !value || PASSWORD.test(value), t("password"))
        .transform((value) => value || null)
        .nullish()
    : v.string().trim().min(1, v.required).regex(PASSWORD, t("password"));
  const confirmPass = v
    .string()
    .trim()
    .transform((value) => value || null)
    .nullish();
  const schema = z.object({
    name: v
      .string()
      .overwrite(normalize)
      .min(1, v.required)
      .refine((value) => !value || !TITLES.test(value), t("nameTitles"))
      .refine((value) => !value || FULL_NAME.test(value), t("nameFormat")),
    email: v
      .string()
      .min(1, v.required)
      .email(v.email)
      .refine(
        (value) => !options.requireUniversityEmail || UNIBA_EMAIL.test(value),
        t("isUniba"),
      ),
    password,
    confirmPass,
    address: z.object({
      street: addressField(),
      city: addressField(),
      postal: addressField(),
      country: addressField(),
    }),
    organization: v
      .string()
      .overwrite(normalize)
      .min(3, t("organizationFullName")),
    telephone: options.requirePhone
      ? v
          .string()
          .trim()
          .min(1, v.required)
          .refine((value) => Boolean(parsePhone(value)?.isValid()), t("phone"))
      : v.string().trim().nullish(),
    studyProgramme: options.student
      ? z.enum(StudyProgramme, { error: v.required })
      : z.enum(StudyProgramme).nullish(),
    access: z.array(z.enum(Access)).optional(),
    privacy: z
      .boolean({ error: v.required })
      .refine((value) => value, t("privacy")),
    files: z
      .array(z.file())
      .max(1, t("maxFiles", { value: 1 }))
      .min(options.requireCv ? 1 : 0, t("minFiles", { value: 1 })),
    avatar: z
      .file()
      .refine(
        (file) => file.size < 2_000_000,
        "Only pictures up to 2MB are permitted.",
      )
      .nullish(),
  });
  return schema
    .refine(
      (value) =>
        (!value.password && !options.registering) || Boolean(value.confirmPass),
      {
        path: ["confirmPass"],
        message: v.required,
        when: ({ value }) =>
          z.object({ password, confirmPass }).safeParse(value).success,
      },
    )
    .refine(
      (value) => !value.password || value.confirmPass === value.password,
      {
        path: ["confirmPass"],
        message: t("confirmPass"),
        when: ({ value }) =>
          z.object({ password, confirmPass }).safeParse(value).success,
      },
    );
}
