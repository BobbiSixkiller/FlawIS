"use client";
import type { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import { useTranslation } from "@/lib/i18n/client";
import { useEffect } from "react";
import { Trans } from "react-i18next";

import Button from "@/components/Button";
import CheckBox from "@/components/Checkbox";
import { FormContainer } from "@/components/form";
import AvatarInput from "@/components/ImageFileInput";
import { Input } from "@/components/Input";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import PhoneInput from "@/components/PhoneInput";
import Select from "@/components/Select";
import Spinner from "@/components/Spinner";
import useUser from "@/hooks/useUser";
import { cn, uploadOrDelete } from "@/lib/utilsClient";
import {
  Access,
  Address,
  StudyProgramme,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { createUserFormSchema } from "@/lib/validation/user-form-schema";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useScrollStore } from "@/stores/scrollStore";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { addUser, register, updateUser } from "./actions";

export default function UserForm({
  user,
  subdomain,
  namespace,
  dialogId,
}: {
  user?: UserFragment;
  subdomain?: string;
  namespace: "profile" | "register";
  dialogId?: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, [namespace, "validation", "common"]);
  const path = usePathname();
  const searchParams = useSearchParams();

  const ctxUser = useUser();

  const { t: validationT } = useTranslation(lng, "validation");
  const schema = createUserFormSchema(validationT, {
    profile: namespace === "profile",
    requireUniversityEmail: Boolean(
      (searchParams.get("token") === null && subdomain?.includes("intern")) ||
      ctxUser?.access.includes(Access.Student),
    ),
    student: Boolean(ctxUser?.access.includes(Access.Student)),
    requirePhone: Boolean(
      subdomain?.includes("conferences") || subdomain?.includes("intern"),
    ),
    requireCv: Boolean(
      ctxUser?.access.includes(Access.Student) ||
      ctxUser?.access.includes(Access.CourseAttendee),
    ),
    registering: path === "/register",
  });

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);
  const scrollToTop = useScrollStore((s) => s.getScroll);

  const router = useRouter();

  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      defaultValues={{
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
        files:
          path.includes("users") ||
          path.includes("profile") ||
          namespace === "profile"
            ? undefined
            : [],
        avatar: undefined,
      }}
      schema={schema}
    >
      {(methods) => (
        <form
          className="space-y-6 sm:w-96"
          onSubmit={methods.handleSubmit(
            async (val) => {
              const { error, url: cvUrl } = await uploadOrDelete(
                "resumes",
                user?.cvUrl,
                val.files[0],
              );
              if (error) {
                return methods.setError("files", { message: error });
              }

              const { error: avatarErr, url: avatarUrl } =
                val.avatar === undefined
                  ? { url: user?.avatarUrl }
                  : await uploadOrDelete(
                      "avatars",
                      user?.avatarUrl,
                      val.avatar,
                    );
              if (avatarErr) {
                return methods.setError("avatar", { message: avatarErr });
              }

              let res;
              if (path.includes("register")) {
                res = await register({
                  token: searchParams.get("token")?.toString(),
                  email: val.email,
                  name: val.name,
                  password: val.password as string,
                  organization: val.organization,
                  telephone: val.telephone ? val.telephone : undefined,
                });
              } else if (user) {
                res = await updateUser(user.id, {
                  email: val.email,
                  name: val.name,
                  organization: val.organization,
                  access: val.access,
                  password: val.password ? val.password : undefined,
                  telephone: val.telephone ? val.telephone : null,
                  studyProgramme: val.studyProgramme as StudyProgramme,
                  cvUrl,
                  avatarUrl,
                  address: val.address ? (val.address as Address) : undefined,
                });
              } else {
                res = await addUser({
                  email: val.email,
                  name: val.name,
                  password: val.password as string,
                  organization: val.organization,
                  telephone: val.telephone,
                  access: val.access,
                });
              }

              if (res) {
                setMessage(res.message, res.success);
              }

              if (res?.errors) {
                for (const [key, value] of Object.entries(res.errors)) {
                  methods.setError(
                    key as keyof (typeof methods)["formState"]["errors"],
                    {
                      message: value,
                    },
                    { shouldFocus: true },
                  );
                }
              }

              // Scroll to top of the ScrollWrapper component only of there is no form field error set
              if (!res?.success && !res?.errors) {
                scrollToTop("auth-scroll");
              }

              if (res?.success && dialogId) {
                closeDialog(dialogId);
              }

              if (path.includes("/profile/update")) {
                router.back();
              }
              if (path.includes("register")) {
                const url = searchParams.get("url")?.toString();

                window.location.replace(url ? url : "/");
              }
            },
            (errors) => console.log(errors),
          )}
        >
          {path.includes("update") && (
            <FormField<FormValues, "avatar"> name="avatar">
              {({ field, controlProps, initialize, onError }) => (
                <AvatarInput
                  {...field}
                  {...controlProps}
                  avatarUrl={user?.avatarUrl ? user.avatarUrl : undefined}
                  onLoad={initialize}
                  onError={onError}
                  buttonLabel={"Fotka"}
                  aria-label={"Fotka"}
                />
              )}
            </FormField>
          )}
          <FormField<FormValues, "name"> name="name" label={t("name")}>
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="name"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <UniversityOrganization />
          <FormField<FormValues, "email"> name="email" label={t("email")}>
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="email"
                value={field.value ?? ""}
              />
            )}
          </FormField>

          {path.includes("users") && (
            <FormField<FormValues, "access"> name="access" label="Access">
              {({ field, controlProps }) => (
                <Select
                  {...field}
                  {...controlProps}
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
            </FormField>
          )}

          <FormField<FormValues, "telephone">
            name="telephone"
            label={t("phone")}
          >
            {({ field, controlProps }) => (
              <PhoneInput {...field} {...controlProps} />
            )}
          </FormField>
          <FormField<FormValues, "organization">
            name="organization"
            label={t("org")}
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="off"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>

          {(path.includes("users") ||
            user?.access.includes(Access.Student)) && (
            <>
              <div className="flex gap-2">
                <FormField<FormValues, "address.street">
                  name="address.street"
                  label={t("street", { ns: "common" })}
                >
                  {({ field, controlProps }) => (
                    <Input
                      {...field}
                      {...controlProps}
                      autoComplete="address-line1"
                      value={inputValue(field.value, undefined)}
                      onChange={(event) => {
                        field.onChange(inputChange(event));
                      }}
                    />
                  )}
                </FormField>
                <FormField<FormValues, "address.city">
                  name="address.city"
                  label={t("city", { ns: "common" })}
                >
                  {({ field, controlProps }) => (
                    <Input
                      {...field}
                      {...controlProps}
                      autoComplete="address-level2"
                      value={inputValue(field.value, undefined)}
                      onChange={(event) => {
                        field.onChange(inputChange(event));
                      }}
                    />
                  )}
                </FormField>
              </div>
              <div className="flex gap-2">
                <FormField<FormValues, "address.postal">
                  name="address.postal"
                  label={t("postal", { ns: "common" })}
                >
                  {({ field, controlProps }) => (
                    <Input
                      {...field}
                      {...controlProps}
                      autoComplete="postal-code"
                      value={inputValue(field.value, undefined)}
                      onChange={(event) => {
                        field.onChange(inputChange(event));
                      }}
                    />
                  )}
                </FormField>
                <FormField<FormValues, "address.country">
                  name="address.country"
                  label={t("country", { ns: "common" })}
                >
                  {({ field, controlProps }) => (
                    <Input
                      {...field}
                      {...controlProps}
                      autoComplete="country"
                      value={inputValue(field.value, undefined)}
                      onChange={(event) => {
                        field.onChange(inputChange(event));
                      }}
                    />
                  )}
                </FormField>
              </div>

              <FormField<FormValues, "studyProgramme">
                name="studyProgramme"
                label="Ročník"
              >
                {({ field, controlProps }) => (
                  <Select
                    {...field}
                    {...controlProps}
                    options={[
                      {
                        name: "1. bakalársky",
                        value: StudyProgramme.Bachelor1,
                      },
                      {
                        name: "2. bakalársky",
                        value: StudyProgramme.Bachelor2,
                      },
                      {
                        name: "3. bakalársky",
                        value: StudyProgramme.Bachelor3,
                      },
                      { name: "1. magisterský", value: StudyProgramme.Master1 },
                      { name: "2. magisterský", value: StudyProgramme.Master2 },
                    ]}
                  />
                )}
              </FormField>
            </>
          )}

          {(path.includes("users") ||
            path.includes("profile") ||
            namespace === "profile") && (
            <FormField<FormValues, "files"> name="files" label="CV.pdf">
              {({ field, controlProps, initialize, onError }) => (
                <MultipleFileUploadField
                  {...field}
                  {...controlProps}
                  maxFiles={1}
                  accept={{
                    "application/pdf": [".pdf"],
                  }}
                  fileSources={{ resumes: user?.cvUrl }}
                  onLoad={initialize}
                  onError={onError}
                />
              )}
            </FormField>
          )}

          {!path.includes("profile") && namespace !== "profile" && (
            <>
              <FormField<FormValues, "password">
                name="password"
                label={t("password")}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="password"
                    autoComplete="current-password"
                    value={inputValue(field.value, "password")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "confirmPass">
                name="confirmPass"
                label={t("confirmPass")}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="password"
                    autoComplete="current-password"
                    value={inputValue(field.value, "password")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
            </>
          )}

          {path.includes("register") && (
            <FormField<FormValues, "privacy">
              name="privacy"
              label={
                <Trans
                  i18nKey={"privacy"}
                  t={t}
                  components={{
                    privacy: (
                      <a
                        key={0}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        href="https://uniba.sk/ochrana-osobnych-udajov/"
                        className={cn([
                          "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                          "dark:text-primary-300 dark:hover:text-primary-300/90 dark:focus:ring-offset-gray-900 dark:focus:ring-primary-300",
                        ])}
                      />
                    ),
                  }}
                />
              }
              layout="inline"
            >
              {({ field, controlProps }) => (
                <CheckBox
                  {...field}
                  {...controlProps}
                  checked={Boolean(field.value)}
                />
              )}
            </FormField>
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
      )}
    </FormContainer>
  );
}

function UniversityOrganization() {
  const { control, setValue } =
    useFormContext<z.input<ReturnType<typeof createUserFormSchema>>>();
  const email = useWatch({ control, name: "email" });
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "common");
  useEffect(() => {
    if (email?.includes("uniba"))
      setValue("organization", t("flaw"), { shouldValidate: true });
  }, [email, setValue, t]);
  return null;
}
