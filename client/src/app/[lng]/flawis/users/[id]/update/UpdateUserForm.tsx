"use client";

import {
  Access,
  StudyProgramme,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useCallback, useContext, useEffect, useState } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import Select from "@/components/Select";
import useValidation from "@/hooks/useValidation";
import { updateUser } from "../../../profile/update/actions";
import { FormMessage } from "@/components/Message";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Spinner from "@/components/Spinner";
import { fetchFromMinio, uploadOrDelete } from "@/utils/helpers";

export default function UpdateUserForm({
  lng,
  user,
}: {
  lng: string;
  user: UserFragment;
}) {
  const router = useRouter();
  const { t } = useTranslation(lng, ["profile", "common"]);

  const { dispatch } = useContext(MessageContext);

  const { yup } = useValidation();

  const [loadingFile, setLoadingFile] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      if (user.cvUrl) {
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

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        organization: yup.string(),
        telephone: yup.string(),
        access: yup
          .array()
          .of(yup.string<Access>().required())
          .required()
          .min(1, ({ min }) => `Pouzivatel musi mat aspon ${min} pristup!`),
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .max(1, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required(),
        studyProgramme: yup.string().nullable(),
        password: yup
          .string()
          .trim()
          .transform((value) => (!value ? null : value))
          .nullable()
          .matches(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s]{6,}$/,
            t("password", { ns: "validation" })
          ),
        confirmPass: yup
          .string()
          .trim()
          .when("password", (password, schema) =>
            password[0]
              ? schema.oneOf(
                  [yup.ref("password")],
                  t("confirmPass", { ns: "validation" })
                )
              : schema.transform((value) => (!value ? null : value)).nullable()
          ),
      })
    ),
    defaultValues: {
      email: user.email,
      name: user.name,
      organization: user.organization || "",
      access: user.access,
      telephone: user.telephone || "",
      studyProgramme: user.studyProgramme || undefined,
      files: [],
      password: "",
      confirmPass: "",
    },
  });

  const email = methods.watch("email");
  useEffect(() => {
    if (email.includes("uniba")) {
      methods.setValue(
        "organization",
        "Univerzita Komenského v Bratislave, Právnická fakulta"
      );
    }
  }, [email, lng]);

  if (loadingFile)
    return (
      <div className="h-full sm:w-96 mx-auto flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 mt-4 sm:w-96 mx-auto"
        onSubmit={methods.handleSubmit(async (val) => {
          const { error, url } = await uploadOrDelete(
            "resumes",
            user?.cvUrl,
            val.files[0]
          );
          if (error) {
            return methods.setError("files", { message: error });
          }

          const state = await updateUser(user.id, {
            access: val.access,
            email: val.email,
            name: val.name,
            organization: val.organization ? val.organization : undefined,
            password: val.password ? val.password : undefined,
            telephone: val.telephone ? val.telephone : undefined,
            studyProgramme: val.studyProgramme as StudyProgramme,
            cvUrl: url,
          });

          if (!state.success) {
            dispatch({
              type: ActionTypes.SetFormMsg,
              payload: state,
            });
          }

          if (state.success) {
            dispatch({
              type: ActionTypes.SetAppMsg,
              payload: state,
            });
            router.back();
          }
        })}
      >
        <Input label="Meno" name="name" />
        <Input label="Email" name="email" />
        <Textarea label="Organizacia" name="organization" />
        <Input label="Telefon" name="telephone" />
        <Select
          label={t("access")}
          // placeholder={t("access")}
          name="access"
          options={[
            { name: Access.Admin, value: Access.Admin },
            {
              name: Access.ConferenceAttendee,
              value: Access.ConferenceAttendee,
            },
            { name: Access.Organization, value: Access.Organization },
            { name: Access.Student, value: Access.Student },
          ]}
          multiple
        />
        <Select
          name="studyProgramme"
          label="Ročník"
          options={[
            { name: "1. bakalársky", value: StudyProgramme.Bachelor1 },
            { name: "2. bakalársky", value: StudyProgramme.Bachelor2 },
            { name: "3. bakalársky", value: StudyProgramme.Bachelor3 },
            { name: "1. magisterský", value: StudyProgramme.Master1 },
            { name: "2. magisterský", value: StudyProgramme.Master2 },
            { name: "N/A", value: null },
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
        <Input label="Heslo" name="password" />
        <Input label="Potvrdit heslo" name="confirmPass" />

        <FormMessage />

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2"
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
