"use client";
import { z } from "zod";
import { useTranslation } from "@/lib/i18n/client";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";
import { compareFields } from "@/lib/validation/form-validation";

import Button from "@/components/Button";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import { Textarea } from "@/components/Textarea";
import TiptapEditor from "@/components/editor/Editor";
import { FormContainer } from "@/components/form";
import useValidation from "@/hooks/useValidation";
import { handleAPIErrors } from "@/lib/utilsClient";
import { CourseSessionFragment } from "@/lib/graphql/generated/graphql";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { createCourseSession, updateCourseSession } from "./actions";

export default function CourseSessionForm({
  dialogId,
  courseSession,
}: {
  dialogId: string;
  courseSession?: CourseSessionFragment;
}) {
  const { v } = useValidation();

  const { id: courseId, lng } = useParams<{ lng: string; id: string }>();
  const { t } = useTranslation(lng, "courses");

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const today = new Date().toUTCString();

  const schema = compareFields(
    z.object({
      course: v.string().min(1, v.required),
      name: v.string().min(1, v.required),
      description: v.string().optional(),
      start: v.date(),
      end: v.date(),
    }),
    "end",
    "start",
    (value, other) => value == null || other == null || value >= other,
    v.required,
  );
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      schema={schema}
      defaultValues={{
        course: courseId,
        name: courseSession?.name ?? "",
        description: courseSession?.description ?? "",
        start: new Date(courseSession?.start ?? today),
        end: new Date(courseSession?.end ?? today),
      }}
    >
      {(methods) => (
        <form
          className="space-y-6 max-w-2xl w-full"
          onSubmit={methods.handleSubmit(
            async (vals) => {
              console.log(vals);
              let res;
              if (courseSession) {
                res = await updateCourseSession({
                  id: courseSession.id,
                  data: vals,
                });
              } else {
                res = await createCourseSession({ data: vals });
              }

              if (res.errors) {
                handleAPIErrors(res.errors, methods.setError);
              }

              setMessage(res.message, res.success);

              if (res.success) {
                closeDialog(dialogId);
              }
            },
            (errs) => console.log(errs),
          )}
        >
          <FormField<FormValues, "name"> name="name" label="Nazov terminu">
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </FormField>
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField<FormValues, "start"> name="start" label="Zaciatok">
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
            <FormField<FormValues, "end"> name="end" label="Koniec">
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
            </FormField>{" "}
          </div>
          <FormField<FormValues, "description"> name="description">
            {({ field, controlProps }) => (
              <TiptapEditor
                {...field}
                {...controlProps}
                aria-label={t("editor.label")}
                className="sm:w-[580px] md:w-[672px]"
              />
            )}
          </FormField>

          <Button
            type="submit"
            disabled={methods.formState.isSubmitting}
            className="w-full"
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : courseSession ? (
              "Aktualizovat"
            ) : (
              "Vytvorit"
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
