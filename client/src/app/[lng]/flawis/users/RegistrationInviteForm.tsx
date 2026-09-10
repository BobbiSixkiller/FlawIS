"use client";
import { z } from "zod";

import { FormField } from "@/components/form";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import GenericCombobox from "@/components/GenericCombobox";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { sendInvites } from "./actions";

export default function RegistrationInviteForm({
  dialogId,
}: {
  dialogId: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { v } = useValidation();

  const { t } = useTranslation(lng, "common");

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    emails: z
      .array(v.string().email(v.email).min(1, v.required))
      .min(1, v.min(1)),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer defaultValues={{ emails: [] }} schema={schema}>
      {(methods) => (
        <form
          className="space-y-6 mt-4 w-full sm:w-96 mx-auto"
          onSubmit={methods.handleSubmit(
            async ({ emails }) => {
              const res = await sendInvites({ input: { emails } });

              setMessage(res.message, res.success);

              if (res.errors) {
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

              if (res.success) {
                closeDialog(dialogId);
              }
            },
            (errs) => {
              console.log(errs);
            },
          )}
        >
          <FormField<FormValues, "emails"> name="emails">
            {({ field, controlProps, onError, itemErrors }) => (
              <GenericCombobox<{ id: number; val: string }, string>
                {...field}
                {...controlProps}
                placeholder="Email adresy organizacii pre staze..."
                allowCreateNewOptions
                multiple
                lng={lng}
                defaultOptions={[]}
                getOptionLabel={(opt) => opt.val}
                renderOption={(opt, props) => <span>{opt.val}</span>}
                getOptionValue={(opt) => opt?.val ?? ""}
                onError={onError}
                itemErrors={itemErrors}
              />
            )}
          </FormField>

          <Button
            className="w-full"
            type="submit"
            size="sm"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              t("confirm")
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
