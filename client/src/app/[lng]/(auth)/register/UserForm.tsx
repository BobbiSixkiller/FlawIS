"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useCallback, useContext, useEffect, useState } from "react";
import { Trans } from "react-i18next";

import Button from "@/components/Button";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addUser, register, updateUser } from "./actions";
import { Input } from "@/components/Input";
import CheckBox from "@/components/Checkbox";
import PhoneInput from "@/components/PhoneInput";
import parsePhoneNumberFromString from "libphonenumber-js";
import { FormMessage } from "@/components/Message";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Select from "@/components/Select";
import {
  Access,
  StudyProgramme,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import useValidation from "@/hooks/useValidation";
import Spinner from "@/components/Spinner";
import { fetchFromMinio, uploadOrDelete } from "@/utils/helpers";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";

export default function UserForm({
  user,
  subdomain,
  namespace,
  inModal,
}: {
  user?: UserFragment;
  subdomain?: string;
  namespace: string;
  inModal?: boolean;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, [namespace, "validation", "common"]);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const [loadingFile, setLoadingFile] = useState(
    (user && typeof user.cvUrl === "string") || false
  );

  const fetchFiles = useCallback(async () => {
    try {
      if (user?.cvUrl) {
        const file = await fetchFromMinio("resumes", user.cvUrl);
        methods.setValue("files", [file]);
      }
      setLoadingFile(false);
    } catch (error: any) {
      console.log(error.message);
      methods.setError("files", { message: error.message });
      setLoadingFile(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, []);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        name: yup.string().trim().required(),
        email: yup.string().required().email(),
        password: yup
          .string()
          .trim()
          .when({
            is: () => path.includes("update"),
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
        organization: yup
          .string()
          .trim()
          .nullable()
          .when([], {
            is: () => subdomain === "conferences",
            then: (schema) => schema.required(),
          }),
        telephone: yup
          .string()
          .trim()
          .nullable()
          .when([], {
            is: () => subdomain === "conferences",
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
        studyProgramme: yup.mixed<StudyProgramme>().nullable(),
        access: yup.array().of(yup.string<Access>().required()),
        privacy: yup
          .boolean()
          .oneOf([true], t("privacy", { ns: "validation" }))
          .required(),
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .max(1, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required(),
        url: yup.string(),
      })
    ),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPass: "",
      access: user?.access || [],
      organization: user?.organization || "",
      telephone: user?.telephone || "",
      studyProgramme: user?.studyProgramme || null,
      privacy: path === "/register" ? false : true,
      files: [],
      url: searchParams.get("url")?.toString(),
    },
  });

  const email = methods.watch("email");
  useEffect(() => {
    if (email.includes("uniba")) {
      methods.setValue("organization", t("flaw", { ns: "common" }));
    }
  }, [email, lng, t]);

  const { dispatch } = useContext(MessageContext);

  if (loadingFile)
    return (
      <div className="h-full sm:w-96 mx-auto flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <FormProvider {...methods}>
      <form
        className={`space-y-6 mt-4 w-full ${inModal && "sm:w-96"}`}
        onSubmit={methods.handleSubmit(
          async (val) => {
            console.log(val);
            const { error, url } = await uploadOrDelete(
              "resumes",
              user?.cvUrl,
              val.files[0]
            );
            if (error) {
              return methods.setError("files", { message: error });
            }

            let state;
            if (path.includes("register")) {
              state = await register({
                url: val.url,
                email: val.email,
                name: val.name,
                password: val.password as string,
                organization: val.organization ? val.organization : undefined,
                telephone: val.telephone ? val.telephone : undefined,
              });
            } else if (path.includes("update") && user) {
              state = await updateUser(user.id, {
                email: val.email,
                name: val.name,
                organization: val.organization ? val.organization : undefined,
                access: val.access,
                password: val.password ? val.password : undefined,
                telephone: val.telephone ? val.telephone : undefined,
                studyProgramme: val.studyProgramme as StudyProgramme,
                cvUrl: url,
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
              router.back();
            }
          },
          (errors) => console.log(errors)
        )}
      >
        <FormMessage />

        <Input label={t("name")} name="name" />
        <Input label={t("email")} name="email" />

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

        {(subdomain === "conferences" || path.includes("users")) && (
          <>
            <PhoneInput label={t("phone")} name="telephone" />
            <Input label={t("org")} name="organization" />
          </>
        )}

        {(path.includes("users") || user?.access.includes(Access.Student)) && (
          <>
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

        {!path.includes("profile") && (
          <>
            <Input type="password" label={t("password")} name="password" />
            <Input
              type="password"
              label={t("confirmPass")}
              name="confirmPass"
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
                      className="text-sm font-semibold text-primary-500 hover:text-primary-700 focus:outline-primary-500"
                    />
                  ),
                }}
              />
            }
          />
        )}

        <Button
          color="primary"
          type="submit"
          fluid
          loadingText={t("submitting")}
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting}
        >
          {t("submit")}
        </Button>
      </form>
    </FormProvider>
  );
}
