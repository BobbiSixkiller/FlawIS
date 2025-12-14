"use client";

import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import {
  ApplicationFragment,
  Semester,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { uploadOrDelete } from "@/utils/helpers";
import { useParams } from "next/navigation";
import { deleteFiles } from "@/lib/minio";
import { changeInternData, createIntern } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import RHFormContainer from "@/components/RHFormContainer";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import CheckBox from "@/components/Checkbox";
import Select from "@/components/Select";

export default function ApplicationForm({
  user,
  application,
  dialogId,
}: {
  user: UserFragment;
  application?: ApplicationFragment | null;
  dialogId: string;
}) {
  const { lng, internshipId } = useParams<{
    lng: string;
    internshipId: string;
  }>();
  const { t } = useTranslation(lng, ["validation", "common"]);

  const { yup } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <RHFormContainer
      yupSchema={yup.object({
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .min(1, (val) => t("minFiles", { value: val.min, ns: "validation" }))
          .max(5, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required(),
        semester: yup.string<Semester>().required(),
      })}
      defaultValues={{
        files: [],
        semester: application?.semester ?? Semester.Winter,
      }}
    >
      {(methods) => (
        <form
          onSubmit={methods.handleSubmit(
            async (vals) => {
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

                state = await changeInternData({
                  fileUrls: urls,
                  id: application.id,
                  semester: vals.semester,
                });
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

                state = await createIntern({
                  internshipId,
                  fileUrls: urls,
                  semester: vals.semester,
                });
                if (!state.success) {
                  await deleteFiles(urls);
                }
              }

              setMessage(state.message, state.success);

              if (state.success) {
                closeDialog(dialogId);
              }
            },
            (err) => console.log(err)
          )}
          className="space-y-6 sm:w-96"
        >
          <Select
            name="semester"
            label={"Mam zaujem stazovat v semestri"}
            control={methods.control}
            options={[
              { name: "Zimny", value: Semester.Winter },
              { name: "Letny", value: Semester.Summer },
              { name: "Zimny aj letny", value: Semester.Both },
            ]}
          />

          <MultipleFileUploadField
            control={methods.control}
            setValue={methods.setValue}
            setError={methods.setError}
            label="CV, motivacny list, ine... (.pdf)"
            name="files"
            maxFiles={5}
            accept={{
              "application/pdf": [".pdf"],
            }}
            fileSources={{
              resumes: !application?.fileUrls ? user?.cvUrl : undefined,
              internships: application?.fileUrls,
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
      )}
    </RHFormContainer>
  );
}
