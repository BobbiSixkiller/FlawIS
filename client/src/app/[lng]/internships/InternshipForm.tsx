"use client";

import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import Button from "@/components/Button";
import Editor from "@/components/editor/Editor";
import { createInternship, updateInternship } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import useDefaultContent from "@/components/editor/useDefaultContent";
import RHFormContainer from "@/components/RHFormContainer";

export default function InternshipForm({
  data,
  dialogId,
  organization,
}: {
  data?: { id: string; description: string };
  organization?: string | null;
  dialogId: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, ["internships", "common"]);
  const { closeDialog } = useDialogStore();

  const { yup } = useValidation();

  const { defaultInternshipEditorContent } = useDefaultContent(
    lng,
    organization
  );

  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <RHFormContainer
      yupSchema={yup.object({
        description: yup.string().required(),
      })}
      defaultValues={{ description: data?.description || "" }}
    >
      {(methods) => (
        <form
          className="space-y-6 w-full"
          onSubmit={methods.handleSubmit(async (vals) => {
            let state;

            if (data) {
              state = await updateInternship({ id: data.id, input: vals });
            } else {
              state = await createInternship(vals);
            }

            setMessage(state.message, state.success);

            if (state && state.success) {
              closeDialog(dialogId);
            }
          })}
        >
          <div>
            <p className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2">
              {t("editor.label")}
            </p>

            <Editor
              control={methods.control}
              name="description"
              initialValue={data?.description || defaultInternshipEditorContent}
            />
          </div>

          <Button
            type="submit"
            className="w-full sm:w-fit"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : data ? (
              t("confirm", { ns: "common" })
            ) : (
              t("submit", { ns: "common" })
            )}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
