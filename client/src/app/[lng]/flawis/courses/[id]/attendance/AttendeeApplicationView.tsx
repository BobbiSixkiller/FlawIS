"use client";

import Button from "@/components/Button";
import {
  AttendanceFragment,
  FieldType,
  FormFragment,
  Status,
} from "@/lib/graphql/generated/graphql";
import { deleteFiles } from "@/lib/minio";
import { useMessageStore } from "@/stores/messageStore";
import { useDialogStore } from "@/stores/dialogStore";
import { uploadToMinio } from "@/utils/helpers";
import useUser from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { updateCourseAttendee } from "../actions";
import RegistrationFormFields from "../RegistrationFormFields";

interface AttendeeApplicationViewProps {
  attendee: AttendanceFragment["attendee"];
  registrationForm: FormFragment;
  dialogId: string;
}

export default function AttendeeApplicationView({
  attendee,
  registrationForm,
  dialogId,
}: AttendeeApplicationViewProps) {
  const { lng } = useParams<{ lng: string }>();
  const user = useUser();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const canEdit = attendee.status === Status.Applied;

  const existingAnswers = useMemo(() => {
    return (attendee.application?.answers ?? {}) as Record<
      string,
      string | string[]
    >;
  }, [attendee.application?.answers]);

  const defaultValues = useMemo(() => {
    const defaults: Record<string, string | string[] | File[]> = {};

    registrationForm.fields.forEach((field) => {
      if (field.type === FieldType.FileUpload) {
        defaults[`field_${field.id}`] = [];
      } else {
        const val = existingAnswers[field.id];
        if (val !== undefined) {
          defaults[`field_${field.id}`] = val;
        }
      }
    });

    return defaults;
  }, [registrationForm.fields, existingAnswers]);

  const methods = useForm({ defaultValues });

  const onSubmit = async (vals: Record<string, unknown>) => {
    const answers: Record<string, string | string[]> = {};

    await Promise.all(
      registrationForm.fields.map(async (field) => {
        const fieldName = `field_${field.id}`;
        const val = vals[fieldName];

        if (field.type === FieldType.FileUpload) {
          const files = (val as File[]) ?? [];
          const newUrls = await Promise.all(
            files.map((file) =>
              uploadToMinio("courses", `${user?.email}/${file.name}`, file),
            ),
          );

          const existingUrls = existingAnswers[field.id];
          if (Array.isArray(existingUrls) && existingUrls.length > 0) {
            await deleteFiles(existingUrls);
          }

          answers[field.id] = newUrls;
        } else {
          answers[field.id] = (val as string) ?? "";
        }
      }),
    );

    const res = await updateCourseAttendee({
      id: attendee.id,
      application: {
        form: registrationForm.id,
        formVersion: registrationForm.version,
        answers,
      },
    });

    setMessage(res.message, res.success);

    if (res.success) {
      closeDialog(dialogId);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {!canEdit && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Prihlaska bola spracovana a nie je mozne ju upravovat.
          </p>
        )}

        <RegistrationFormFields
          fields={registrationForm.fields}
          canEdit={canEdit}
          control={methods.control}
          setValue={methods.setValue}
          setError={methods.setError}
          existingAnswers={existingAnswers}
          lng={lng}
        />

        {canEdit && (
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={methods.formState.isSubmitting}
          >
            Uložiť
          </Button>
        )}
      </form>
    </FormProvider>
  );
}
