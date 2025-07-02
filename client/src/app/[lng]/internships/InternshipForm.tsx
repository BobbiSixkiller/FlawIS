"use client";

import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import Button from "@/components/Button";
import Editor from "@/components/editor/Editor";
import { createInternship, updateInternship } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import useDefaultContent from "@/components/editor/useDefaultContent";
import { useEffect } from "react";

export default function InternshipForm({
  data,
  dialogId,
}: {
  data?: { id: string; description: string };
  dialogId: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, ["internships", "common"]);
  const { closeDialog } = useDialogStore();

  const { yup } = useValidation();
  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        description: yup.string().required(),
      })
    ),
    defaultValues: { description: data?.description || "" },
  });

  const { defaultInternshipEditorContent } = useDefaultContent(lng);

  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
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
    </FormProvider>
  );
}
