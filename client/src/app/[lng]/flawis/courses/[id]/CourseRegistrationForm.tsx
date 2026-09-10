"use client";
import { createRegistrationSchema } from "@/lib/validation/registration-form-schema";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import BillingInput from "@/app/[lng]/conferences/[slug]/register/BillingInput";
import { Input } from "@/components/Input";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import useUser from "@/hooks/useUser";
import useValidation from "@/hooks/useValidation";
import { uploadToMinio } from "@/lib/utilsClient";
import {
  CourseFragment,
  FieldType,
  Status,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { deleteFiles } from "@/lib/minio";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { createCourseAttendee, updateCourseAttendee } from "./actions";
import RegistrationFormFields from "./RegistrationFormFields";

export default function CourseRegistrationForm({
  course,
  dialogId,
  redirect,
}: {
  course: CourseFragment;
  dialogId?: string;
  redirect?: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, ["validation", "conferences"]);

  const { v } = useValidation();

  const user = useUser();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const router = useRouter();

  const isUpdate =
    !!course.attending && course.attending.status === Status.Applied;
  const canEdit =
    !course.attending || course.attending.status === Status.Applied;

  // Pre-fill existing answers when updating
  const registrationFormDefaults = useMemo(() => {
    if (!course.attending?.application?.answers) return {};

    const answers = course.attending.application.answers as Record<
      string,
      string | string[]
    >;
    const defaults: Record<string, string | string[]> = {};
    course.registrationForm.fields.forEach((field) => {
      const val = answers[field.id];
      if (val !== undefined && field.type !== FieldType.FileUpload) {
        defaults[`field_${field.id}`] = val;
      }
    });
    return defaults;
  }, [course.attending, course.registrationForm.fields]);

  const { t: validationT } = useTranslation(lng, "validation");
  const dynamicFieldsSchema = useMemo(
    () => createRegistrationSchema(course.registrationForm.fields, validationT),
    [course.registrationForm.fields, validationT],
  );

  // Default values for file upload fields
  const fileFieldDefaults = useMemo(() => {
    const defaults: Record<string, File[] | undefined> = {};
    course.registrationForm.fields
      .filter((f) => f.type === FieldType.FileUpload)
      .forEach((f) => {
        defaults[`field_${f.id}`] = undefined;
      });
    return defaults;
  }, [course.registrationForm.fields]);

  const billingSchema = z.object({
    billing: z.object({
      name: v.string().trim().min(1, v.required),
      address: z.object({
        street: v.string().trim().min(1, v.required),
        city: v.string().trim().min(1, v.required),
        postal: v.string().trim().min(1, v.required),
        country: v.string().trim().min(1, v.required),
      }),
      ICO: v.string().trim().optional(),
      DIC: v.string().trim().optional(),
      ICDPH: v.string().trim().optional(),
    }),
  });
  const registrationSchema = dynamicFieldsSchema;
  const schema = z.intersection(
    course.price > 0
      ? billingSchema
      : z.object({
          billing: z
            .custom<z.input<typeof billingSchema>["billing"]>()
            .nullish(),
        }),
    registrationSchema,
  );
  type FormValues = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;
  return (
    <WizzardForm
      schema={schema}
      className="sm:w-96 mx-auto flex flex-col"
      lng={lng}
      defaultValues={{
        ...fileFieldDefaults,
        ...registrationFormDefaults,
        billing: undefined,
      }}
      onSubmitCb={async (vals, methods) => {
        const answers: Record<string, string | string[]> = {};
        const valsMap = vals as Record<string, unknown>;

        // Upload files for FILE_UPLOAD fields and collect all answers
        await Promise.all(
          course.registrationForm.fields.map(async (field) => {
            const fieldName = `field_${field.id}`;
            const val = valsMap[fieldName];

            if (field.type === FieldType.FileUpload) {
              if (val === undefined) {
                const existing = (
                  course.attending?.application?.answers as
                    | Record<string, string | string[]>
                    | undefined
                )?.[field.id];
                answers[field.id] = Array.isArray(existing) ? existing : [];
                return;
              }
              const files = (val as File[]) ?? [];
              const newUrls = await Promise.all(
                files.map((file) =>
                  uploadToMinio("courses", `${user?.email}/${file.name}`, file),
                ),
              );

              // Only delete old files after new ones are safely uploaded
              const existingUrls =
                course.attending?.application.answers?.[field.id];
              if (Array.isArray(existingUrls) && existingUrls.length > 0) {
                await deleteFiles(existingUrls);
              }

              answers[field.id] = newUrls;
            } else {
              answers[field.id] = (val as string) ?? "";
            }
          }),
        );

        const application = {
          form: course.registrationForm.id,
          formVersion: course.registrationForm.version,
          answers,
        };

        let res;
        if (isUpdate) {
          res = await updateCourseAttendee({
            id: course.attending!.id,
            application,
          });
        } else {
          res = await createCourseAttendee({
            courseId: course.id,
            application,
            billing:
              course.price > 0 ? billingSchema.parse(vals).billing : undefined,
          });
        }

        setMessage(res.message, res.success);

        if (res.success) {
          if (dialogId) {
            closeDialog(dialogId);
          } else if (redirect) {
            router.replace(redirect);
          } else {
            router.back();
          }
        }
      }}
    >
      {course.price > 0 && (
        <WizzardStep<FormValues, FormOutput>
          name={t("registration.billing.info", { ns: "conferences" })}
          id="billing"
          fields={["billing"]}
        >
          {(methods) => (
            <>
              <FormField<FormValues, "billing.name">
                name="billing.name"
                label={t("registration.billing.name", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <BillingInput
                    billings={user?.billings}
                    {...controlProps}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={methods.watch("billing")}
                    onNameChange={field.onChange}
                    onSelect={(billing) =>
                      methods.setValue(
                        "billing",
                        {
                          ...billing,
                          ICO: billing.ICO ?? "",
                          DIC: billing.DIC ?? "",
                          ICDPH: billing.ICDPH ?? "",
                        },
                        { shouldValidate: true, shouldDirty: true },
                      )
                    }
                    onClear={() =>
                      methods.setValue(
                        "billing",
                        {
                          name: "",
                          address: {
                            street: "",
                            city: "",
                            postal: "",
                            country: "",
                          },
                          ICO: "",
                          DIC: "",
                          ICDPH: "",
                        },
                        { shouldValidate: true, shouldDirty: true },
                      )
                    }
                  />
                )}
              </FormField>
              <FormField<FormValues, "billing.address.street">
                name="billing.address.street"
                label={t("registration.billing.street", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "billing.address.city">
                name="billing.address.city"
                label={t("registration.billing.city", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "billing.address.postal">
                name="billing.address.postal"
                label={t("registration.billing.postal", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "billing.address.country">
                name="billing.address.country"
                label={t("registration.billing.country", {
                  ns: "conferences",
                })}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "billing.ICO">
                name="billing.ICO"
                label={t("registration.billing.ICO", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "billing.DIC">
                name="billing.DIC"
                label={t("registration.billing.DIC", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "billing.ICDPH">
                name="billing.ICDPH"
                label={t("registration.billing.ICDPH", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
            </>
          )}
        </WizzardStep>
      )}

      <WizzardStep<FormValues, FormOutput>
        name="Registracny formular"
        id="registration"
        fields={course.registrationForm.fields.map(
          (field) => `field_${field.id}` as const,
        )}
      >
        {(methods) => (
          <>
            {!canEdit && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Vasa prihlaska bola spracovana a nie je mozne ju upravovat.
              </p>
            )}
            <RegistrationFormFields
              lng={lng}
              fields={course.registrationForm.fields}
              canEdit={canEdit}
              existingAnswers={
                course.attending?.application.answers as Record<
                  string,
                  string | string[]
                >
              }
            />
          </>
        )}
      </WizzardStep>
    </WizzardForm>
  );
}
