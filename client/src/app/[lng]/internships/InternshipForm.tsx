"use client";
import { z } from "zod";

import { FormField } from "@/components/form";

import Button from "@/components/Button";
import Editor from "@/components/editor/Editor";
import useDefaultContent from "@/components/editor/useDefaultContent";
import { FormContainer } from "@/components/form";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { createInternship, updateInternship } from "./actions";

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

  const { v } = useValidation();

  const { defaultInternshipEditorContent } = useDefaultContent(
    lng,
    organization,
  );

  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({ description: v.string().min(1, v.required) });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      schema={schema}
      defaultValues={{
        description: data?.description || defaultInternshipEditorContent,
      }}
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
          <FormField<FormValues, "description">
            name="description"
            label={t("editor.label")}
          >
            {({ field, controlProps }) => (
              <Editor {...field} {...controlProps} />
            )}
          </FormField>

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
    </FormContainer>
  );
}
