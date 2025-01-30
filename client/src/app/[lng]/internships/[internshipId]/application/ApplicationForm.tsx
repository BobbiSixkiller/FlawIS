"use client";

import Button from "@/components/Button";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import {
  ApplicationFragment,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { fetchFromMinio, uploadOrDelete } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { changeInternFiles, createIntern } from "./actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";
import { deleteFiles } from "@/lib/minio";

export default function ApplicationForm({
  user,
  application,
}: {
  user: UserFragment;
  application?: ApplicationFragment | null;
}) {
  const [loadingFiles, setLoadingFiles] = useState(true);
  const { lng, internshipId } = useParams<{
    lng: string;
    internshipId: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation(lng, ["validation", "common"]);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .min(1, (val) => t("minFiles", { value: val.min, ns: "validation" }))
          .max(5, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required(),
      })
    ),
    defaultValues: { files: [] },
  });

  useEffect(() => {
    async function fetchFiles() {
      {
        try {
          const clientFiles: File[] = [];

          // If user is applying for the first time there is no application so fetch the users CV and add it to files
          if (user?.cvUrl && !application?.fileUrls) {
            const file = await fetchFromMinio("resumes", user.cvUrl);
            clientFiles.push(file);
          }
          // If there is already application meaning user is editing his/her own application files load just the files from intern document
          if (application?.fileUrls && application.fileUrls.length > 0) {
            for (const url of application.fileUrls) {
              const downloaded = await fetchFromMinio("internships", url);
              clientFiles.push(downloaded);
            }
          }

          methods.setValue("files", clientFiles);

          setLoadingFiles(false);
        } catch (error: any) {
          console.log(error.message);
          methods.setError("files", { message: error.message });
          setLoadingFiles(false);
        }
      }
    }

    fetchFiles();
  }, []);

  const { dispatch } = useContext(MessageContext);

  if (loadingFiles)
    return (
      <div className="h-full mx-auto flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(
          async (vals) => {
            console.log(vals);
            console.log(internshipId);

            const urls = [];
            let state;

            // If there is application prop perform update of intern's files otherwise create new intern
            if (application) {
              console.log("UPDATE");

              for (const [index, file] of vals.files.entries()) {
                const { error, url } = await uploadOrDelete(
                  "internships",
                  application?.fileUrls[index],
                  file,
                  user.email
                );
                if (error) {
                  return methods.setError("files", { message: error });
                }
                if (url) {
                  urls.push(url);
                }
              }

              state = await changeInternFiles(application.id, urls);
            } else {
              console.log("NEW");

              for (const file of vals.files) {
                const { error, url } = await uploadOrDelete(
                  "internships",
                  null,
                  file,
                  user.email
                );
                if (error) {
                  return methods.setError("files", { message: error });
                }
                if (url) {
                  urls.push(url);
                }
              }

              state = await createIntern(urls, internshipId);
              if (!state.success) {
                await deleteFiles(urls);
              }
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
          (err) => console.log(err)
        )}
        className="space-y-6"
      >
        <FormMessage />

        <MultipleFileUploadField
          label="CV, motivacny list, ine... (.pdf)"
          name="files"
          maxFiles={5}
          accept={{
            "application/pdf": [".pdf"],
          }}
        />

        <Button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="w-full"
        >
          {methods.formState.isSubmitting ? (
            <Spinner inverted />
          ) : (
            t("submit", { ns: "common" })
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
