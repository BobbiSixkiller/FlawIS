"use client";

import BillingInput from "@/app/[lng]/conferences/[slug]/(register)/register/BillingInput";
import { Input } from "@/components/Input";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import useUser from "@/hooks/useUser";
import useValidation from "@/hooks/useValidation";
import {
  CourseFragment,
  FieldType,
  Status,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { uploadToMinio } from "@/utils/helpers";
import { useParams, useRouter } from "next/navigation";
import { createCourseAttendee, updateCourseAttendee } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import { useDialogStore } from "@/stores/dialogStore";
import { useMemo } from "react";
import { deleteFiles } from "@/lib/minio";
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

  const { yup } = useValidation();

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
      if (val !== undefined) {
        defaults[`field_${field.id}`] = val;
      }
    });
    return defaults;
  }, [course.attending, course.registrationForm.fields]);

  // Build dynamic Yup schema from form fields
  const dynamicFieldsSchema = useMemo(() => {
    const shape: Record<string, any> = {};

    course.registrationForm.fields.forEach((field) => {
      const fieldName = `field_${field.id}`;

      if (field.type === FieldType.FileUpload) {
        const schema = yup
          .array()
          .of(yup.mixed<File>().required())
          .min(field.minFiles ?? 1, (val) =>
            t("minFiles", { value: val.min, ns: "validation" }),
          )
          .max(field.maxFiles ?? 10, (val) =>
            t("maxFiles", { value: val.max, ns: "validation" }),
          );
        shape[fieldName] = field.required ? schema.required() : schema;
      } else {
        shape[fieldName] = field.required
          ? yup.string().trim().required()
          : yup.string().trim().optional();
      }
    });

    return yup.object(shape);
  }, [course.registrationForm.fields, yup, t]);

  // Default values for file upload fields
  const fileFieldDefaults = useMemo(() => {
    const defaults: Record<string, File[]> = {};
    course.registrationForm.fields
      .filter((f) => f.type === FieldType.FileUpload)
      .forEach((f) => {
        defaults[`field_${f.id}`] = [];
      });
    return defaults;
  }, [course.registrationForm.fields]);

  return (
    <WizzardForm
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
            billing: valsMap.billing as any,
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
      {course.isPaid && (
        <WizzardStep
          name={t("registration.billing.info", { ns: "conferences" })}
          yupSchema={yup.object({
            billing: yup.object({
              name: yup.string().trim().required(),
              address: yup.object({
                street: yup.string().trim().required(),
                city: yup.string().trim().required(),
                postal: yup.string().trim().required(),
                country: yup.string().trim().required(),
              }),
              ICO: yup.string().trim(),
              DIC: yup.string().trim(),
              ICDPH: yup.string().trim(),
            }),
          })}
        >
          {(methods) => (
            <>
              <BillingInput billings={user?.billings} methods={methods} />
              <Input
                label={t("registration.billing.street", { ns: "conferences" })}
                name="billing.address.street"
              />
              <Input
                label={t("registration.billing.city", { ns: "conferences" })}
                name="billing.address.city"
              />
              <Input
                label={t("registration.billing.postal", { ns: "conferences" })}
                name="billing.address.postal"
              />
              <Input
                label={t("registration.billing.country", {
                  ns: "conferences",
                })}
                name="billing.address.country"
              />
              <Input
                label={t("registration.billing.ICO", { ns: "conferences" })}
                name="billing.ICO"
              />
              <Input
                label={t("registration.billing.DIC", { ns: "conferences" })}
                name="billing.DIC"
              />
              <Input
                label={t("registration.billing.ICDPH", { ns: "conferences" })}
                name="billing.ICDPH"
              />
            </>
          )}
        </WizzardStep>
      )}

      <WizzardStep name="Registracny formular" yupSchema={dynamicFieldsSchema}>
        {(methods) => (
          <>
            {!canEdit && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Vasa prihlaska bola spracovana a nie je mozne ju upravovat.
              </p>
            )}
            <RegistrationFormFields
              fields={course.registrationForm.fields}
              canEdit={canEdit}
              control={methods.control}
              setValue={methods.setValue}
              setError={methods.setError}
              existingAnswers={
                course.attending?.application.answers as Record<
                  string,
                  string | string[]
                >
              }
              lng={lng}
            />
          </>
        )}
      </WizzardStep>
    </WizzardForm>
  );
}
