"use client";
import { z } from "zod";

import { LocalizedFormField } from "@/components/form";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import Spinner from "@/components/Spinner";
import { Textarea } from "@/components/Textarea";
import useValidation from "@/hooks/useValidation";
import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { createSection, updateSection } from "./actions";

export default function SectionForm({
  conferenceId,
  dialogId,
  section,
}: {
  dialogId: string;
  conferenceId: string;
  section?: SectionFragment;
}) {
  const { lng } = useParams<{ slug: string; lng: string }>();

  const { v } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    conference: v.string().min(1, v.required),
    translations: z.object({
      sk: z.object({
        name: v.string().trim().min(1, v.required),
        topic: v.string().trim().min(1, v.required),
      }),
      en: z.object({
        name: v.string().trim().min(1, v.required),
        topic: v.string().trim().min(1, v.required),
      }),
    }),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      defaultValues={{
        conference: conferenceId,
        translations: section?.translations || {
          sk: { name: "", topic: "" },
          en: { name: "", topic: "" },
        },
      }}
      schema={schema}
    >
      {(methods) => (
        <form
          className="space-y-6 min-w-80"
          onSubmit={methods.handleSubmit(async (data) => {
            let res;
            if (section) {
              res = await updateSection({ id: section.id, data });
            } else {
              res = await createSection({ data });
            }

            setMessage(res.message, res.success);

            if (res.success) {
              closeDialog(dialogId);
            }
          })}
        >
          <LocalizedFormField<FormValues, `translations.${"sk" | "en"}.name`>
            name={`translations.${lng as "sk" | "en"}.name`}
            lng={lng}
            label="Nazov sekcie"
          >
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </LocalizedFormField>
          <LocalizedFormField<FormValues, `translations.${"sk" | "en"}.topic`>
            name={`translations.${lng as "sk" | "en"}.topic`}
            lng={lng}
            label="Tema sekcie"
          >
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </LocalizedFormField>

          <Button
            color="primary"
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? <Spinner inverted /> : "Vytvorit"}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
