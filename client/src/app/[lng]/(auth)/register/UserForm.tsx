"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useContext, useEffect, useState } from "react";
import { Trans } from "react-i18next";

import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addUser, register, updateUser } from "./actions";
import { Input } from "@/components/Input";
import CheckBox from "@/components/Checkbox";
import PhoneInput from "@/components/PhoneInput";
import parsePhoneNumberFromString from "libphonenumber-js";
import { FormMessage } from "@/components/Message";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import Select from "@/components/Select";
import {
  Access,
  Address,
  StudyProgramme,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import useValidation from "@/hooks/useValidation";
import Spinner from "@/components/Spinner";
import { cn, uploadOrDelete } from "@/utils/helpers";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Button from "@/components/Button";
import AvatarInput from "@/components/ImageFileInput";
import { mixed } from "yup";
import { useDialog } from "@/providers/DialogProvider";
import usePrefillFiles from "@/hooks/usePrefillFiles";

export default function UserForm({
  user,
  subdomain,
  namespace,
  dialogId,
}: {
  user?: UserFragment;
  subdomain?: string;
  namespace: string;
  dialogId?: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, [namespace, "validation", "common"]);
  const path = usePathname();
  const searchParams = useSearchParams();

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        name: yup.string().trim().required(),
        email: yup
          .string()
          .required()
          .email()
          .when({
            is: () =>
              (searchParams.get("token") === null &&
                subdomain?.includes("intern")) ||
              user?.access.includes(Access.Student), // When creating student account on internships tenant
            then: (schema) =>
              schema.matches(
                /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*uniba\.sk$/,
                {
                  message: t("isUniba", { ns: "validation" }),
                }
              ),
          }),
        password: yup
          .string()
          .trim()
          .when({
            is: () => namespace === "profile",
            then: (schema) =>
              schema
                .transform((value) => (!value ? null : value))
                .nullable()
                .matches(
                  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s]{6,}$/,
                  t("password", { ns: "validation" })
                ),
            otherwise: (schema) =>
              schema
                .required()
                .matches(
                  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s]{6,}$/,
                  t("password", { ns: "validation" })
                ),
          }),
        confirmPass: yup
          .string()
          .trim()
          .when("password", ([password], schema) =>
            password || path === "/register"
              ? schema
                  .required()
                  .oneOf(
                    [yup.ref("password")],
                    t("confirmPass", { ns: "validation" })
                  )
              : schema.transform((value) => (!value ? null : value)).nullable()
          ),
        address: yup
          .object({
            street: yup.string(),
            city: yup.string(),
            postal: yup.string(),
            country: yup.string(),
          })
          .when({
            is: () => user?.access.includes(Access.Student),
            then: (schema) =>
              schema.shape({
                street: yup.string().trim().required(),
                city: yup.string().trim().required(),
                postal: yup.string().trim().required(),
                country: yup.string().trim().required(),
              }),
          }),
        organization: yup.string().trim().required(),
        telephone: yup
          .string()
          .trim()
          .nullable()
          .when({
            is: () =>
              subdomain?.includes("conferences") ||
              subdomain?.includes("intern") ||
              user?.access.includes(Access.Student),
            then: (schema) =>
              schema
                .required()
                .test(
                  "is-valid-phone",
                  t("phone", { ns: "validation" }),
                  function (value) {
                    if (!value) return false;
                    const phoneNumber = parsePhoneNumberFromString(value);
                    return phoneNumber?.isValid() || false;
                  }
                ),
          }),
        studyProgramme: yup
          .mixed<StudyProgramme>()
          .nullable()
          .when({
            is: () => user?.access.includes(Access.Student),
            then: (schema) => schema.required(),
          }),
        access: yup.array().of(yup.string<Access>().required()),
        privacy: yup
          .boolean()
          .oneOf([true], t("privacy", { ns: "validation" }))
          .required(),
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .max(1, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required()
          .when({
            is: () => user?.access.includes(Access.Student),
            then: (schema) =>
              schema.min(1, (val) =>
                t("minFiles", { value: val.min, ns: "validation" })
              ),
          }),
        avatar: mixed<File>()
          .nullable()
          .test("fileSize", "Only pictures up to 2MB are permitted.", (file) =>
            file ? file.size < 2_000_000 : true
          ),
      })
    ),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPass: "",
      address: user?.address || {
        city: "",
        country: "",
        postal: "",
        street: "",
      },
      access: user?.access || [],
      organization: user?.organization || "",
      telephone: user?.telephone || "",
      studyProgramme: user?.studyProgramme || null,
      privacy: path === "/register" ? false : true,
      files: [],
      avatar: undefined,
    },
  });

  const loadingFile = usePrefillFiles({
    setError: methods.setError,
    setValue: methods.setValue,
    avatarUrl: user?.avatarUrl,
    cvUrl: user?.cvUrl,
  });

  const email = methods.watch("email");
  useEffect(() => {
    if (email.includes("uniba")) {
      methods.setValue("organization", t("flaw", { ns: "common" }), {
        shouldValidate: true,
      });
    }
  }, [email, lng, t]);

  const { dispatch } = useContext(MessageContext);

  const [showPassword, setShowPassword] = useState(false);

  const { closeDialog } = useDialog();

  if (loadingFile)
    return (
      <div className="h-full sm:w-96 mx-auto flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <FormProvider {...methods}>
      <form
        className={`space-y-6 mt-4`}
        onSubmit={methods.handleSubmit(
          async (val) => {
            const { error, url } = await uploadOrDelete(
              "resumes",
              user?.cvUrl,
              val.files[0]
            );
            if (error) {
              return methods.setError("files", { message: error });
            }

            const { error: avatarErr, url: avatarUrl } = await uploadOrDelete(
              "avatars",
              user?.avatarUrl,
              val.avatar
            );
            if (avatarErr) {
              return methods.setError("avatar", { message: error });
            }

            let state;
            if (path.includes("register")) {
              state = await register({
                url: searchParams.get("url")?.toString(),
                token: searchParams.get("token")?.toString(),
                email: val.email,
                name: val.name,
                password: val.password as string,
                organization: val.organization ? val.organization : undefined,
                telephone: val.telephone ? val.telephone : undefined,
              });
            } else if (
              (path.includes("update") || namespace === "profile") &&
              user
            ) {
              state = await updateUser(user.id, {
                email: val.email,
                name: val.name,
                organization: val.organization ? val.organization : undefined,
                access: val.access,
                password: val.password ? val.password : undefined,
                telephone: val.telephone ? val.telephone : undefined,
                studyProgramme: val.studyProgramme as StudyProgramme,
                cvUrl: url,
                avatarUrl,
                address: val.address ? (val.address as Address) : undefined,
              });
            } else {
              state = await addUser({
                email: val.email,
                name: val.name,
                password: val.password as string,
                organization: val.organization,
                telephone: val.telephone,
                access: val.access,
              });
            }

            if (state && !state.success) {
              dispatch({
                type: ActionTypes.SetFormMsg,
                payload: state,
              });
            }

            if (state && state.success) {
              dispatch({
                type: ActionTypes.SetAppMsg,
                payload: state,
              });

              if (dialogId) {
                closeDialog(dialogId);
              }
            }
          },
          (errors) => console.log(errors)
        )}
      >
        <FormMessage />

        {path.includes("update") && <AvatarInput name="avatar" label="Fotka" />}

        <Input label={t("name")} name="name" autoComplete="name" />
        <Input label={t("email")} name="email" autoComplete="email" />

        {path.includes("users") && (
          <Select
            name="access"
            label="Access"
            multiple
            options={[
              { name: Access.Admin, value: Access.Admin },
              {
                name: Access.ConferenceAttendee,
                value: Access.ConferenceAttendee,
              },
              { name: Access.Organization, value: Access.Organization },
              { name: Access.Student, value: Access.Student },
            ]}
          />
        )}

        <PhoneInput label={t("phone")} name="telephone" autoComplete="off" />
        <Input label={t("org")} name="organization" autoComplete="off" />

        {(path.includes("users") || user?.access.includes(Access.Student)) && (
          <>
            <div className="flex gap-2 w-full">
              <Input
                label={t("street", { ns: "common" })}
                name="address.street"
                autoComplete="address-line1"
              />
              <Input
                label={t("city", { ns: "common" })}
                name="address.city"
                autoComplete="address-level2"
              />
            </div>
            <div className="flex gap-2 w-full">
              <Input
                label={t("postal", { ns: "common" })}
                name="address.postal"
                autoComplete="postal-code"
              />
              <Input
                label={t("country", { ns: "common" })}
                name="address.country"
                autoComplete="country"
              />
            </div>

            <Select
              name="studyProgramme"
              label="Ročník"
              options={[
                { name: "1. bakalársky", value: StudyProgramme.Bachelor1 },
                { name: "2. bakalársky", value: StudyProgramme.Bachelor2 },
                { name: "3. bakalársky", value: StudyProgramme.Bachelor3 },
                { name: "1. magisterský", value: StudyProgramme.Master1 },
                { name: "2. magisterský", value: StudyProgramme.Master2 },
              ]}
            />
            <MultipleFileUploadField
              label="CV.pdf"
              name="files"
              maxFiles={1}
              accept={{
                "application/pdf": [".pdf"],
              }}
            />
          </>
        )}

        {!path.includes("profile") && namespace !== "profile" && (
          <>
            <Input
              name="password"
              label={t("password")}
              type="password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="current-password"
            />
            <Input
              name="confirmPass"
              label={t("confirmPass")}
              type="password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="current-password"
            />
          </>
        )}

        {path.includes("register") && (
          <CheckBox
            name="privacy"
            label={
              <Trans
                i18nKey={"privacy"}
                t={t}
                components={{
                  privacy: (
                    <a
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      href="https://uniba.sk/ochrana-osobnych-udajov/"
                      className={cn([
                        "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        "dark:text-primary-300 dark:hover:text-primary-200 dark:focus:ring-offset-gray-900 dark:focus:ring-primary-300",
                      ])}
                    />
                  ),
                }}
              />
            }
          />
        )}

        <Button
          className="w-full items-center justify-center gap-2"
          type="submit"
          size="sm"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
            <>
              <Spinner inverted />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
