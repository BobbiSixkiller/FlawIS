"use client";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";
import useValidation from "@/hooks/useValidation";
import { compareFields } from "@/lib/validation/form-validation";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { updateConferenceDates } from "./actions";

export default function UpdateDatesForm({
  conference,
  dialogId,
}: {
  conference: ConferenceFragment;
  dialogId: string;
}) {
  const { v } = useValidation();
  const { lng, slug } = useParams<{ lng: string; slug: string }>();
  const { t } = useTranslation(lng, "validation");

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = compareFields(
    compareFields(
      z.object({
        start: v.date(),
        end: v.date(),
        regEnd: v.date().nullable().default(null),
        submissionDeadline: v.date().nullable().default(null),
      }),
      "end",
      "start",
      (value, other) => value == null || other == null || value >= other,
      t("endDateInvalid"),
    ),
    "regEnd",
    "start",
    (value, other) => value == null || other == null || value <= other,
    t("endDateInvalid"),
  );
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      defaultValues={{
        start: new Date(conference.dates.start),
        end: new Date(conference.dates.end),
        regEnd: conference.dates.regEnd
          ? new Date(conference.dates.regEnd)
          : null,
        submissionDeadline: conference.dates.submissionDeadline
          ? new Date(conference.dates.submissionDeadline)
          : null,
      }}
      schema={schema}
    >
      {(methods) => (
        <form
          className="space-y-6 w-full sm:w-96"
          onSubmit={methods.handleSubmit(async (data) => {
            const res = await updateConferenceDates({ slug, data });

            setMessage(res.message, res.success);

            if (res.success) {
              closeDialog(dialogId);
            }
          })}
        >
          <FormField<FormValues, "start">
            name="start"
            label="Zaciatok konferencie"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="datetime-local"
                value={inputValue(field.value, "datetime-local")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "end"> name="end" label="Koniec konferencie">
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="datetime-local"
                value={inputValue(field.value, "datetime-local")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "regEnd">
            name="regEnd"
            label="Koniec registracie"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="datetime-local"
                value={inputValue(field.value, "datetime-local")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "submissionDeadline">
            name="submissionDeadline"
            label="Deadline odovzdania prispevkov"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="datetime-local"
                value={inputValue(field.value, "datetime-local")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>

          <Button
            color="primary"
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              "Aktualizovat datumy"
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
