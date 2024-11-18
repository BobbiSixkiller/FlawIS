"use client";

import { updateUser } from "@/app/[lng]/flawis/profile/update/actions";
import Button from "@/components/Button";
import { Input } from "@/components/Input";
import { FormMessage } from "@/components/Message";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Select from "@/components/Select";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { StudyProgramme, UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { fetchFromMinio, uploadOrDelete } from "@/utils/helpers";

export default function UpdateStudentProfile({ user }: { user: UserFragment }) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, ["profile", "validation"]);
  const router = useRouter();

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        name: yup.string().trim().required(),
        email: yup.string().required().email(),
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .min(1, (val) => t("minFiles", { value: val.min, ns: "validation" }))
          .max(1, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required(),
        studyProgramme: yup.string().required(),
      })
    ),
    defaultValues: {
      name: user.name,
      email: user.email,
      studyProgramme: user.studyProgramme || "",
      files: [],
    },
  });

  const { dispatch } = useContext(MessageContext);

  const [loadingFile, setLoadingFile] = useState(
    typeof user.cvUrl === "string"
  );

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
        onSubmit={methods.handleSubmit(
          async (val) => {
            const { error, url } = await uploadOrDelete(
              "resumes",
              user.cvUrl,
              val.files[0]
            );
            if (error) {
              return methods.setError("files", { message: error });
            }

            const state = await updateUser(user.id, {
              email: val.email,
              name: val.name,
              studyProgramme: val.studyProgramme as unknown as StudyProgramme,
              cvUrl: url,
            });

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

        <Input autoComplete="off" label={t("name")} name="name" />
        <Input autoComplete="off" label={t("email")} name="email" />
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
