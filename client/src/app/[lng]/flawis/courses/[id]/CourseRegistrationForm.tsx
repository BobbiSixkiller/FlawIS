"use client";

import BillingInput from "@/app/[lng]/conferences/[slug]/(register)/register/BillingInput";
import { Input } from "@/components/Input";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import useUser from "@/hooks/useUser";
import useValidation from "@/hooks/useValidation";
import { CourseFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { uploadToMinio } from "@/utils/helpers";
import { useParams, useRouter } from "next/navigation";
import { createCourseAttendee, updateCourseAttendeeFiles } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import { useDialogStore } from "@/stores/dialogStore";
import { deleteFiles } from "@/lib/minio";

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

  return (
    <WizzardForm
      className="sm:w-96 mx-auto flex flex-col"
      lng={lng}
      defaultValues={{ files: [], billing: undefined }}
      onSubmitCb={async (vals, methods) => {
        const urls = [];
        let res;

        if (course?.attending) {
          console.log("UPDATE");
          await deleteFiles(course.attending.fileUrls);
          const urls = await Promise.all(
            vals.files.map((f: File) =>
              uploadToMinio(
                "courses",
                `${course.attending!.user.email}/${f.name}`,
                f
              )
            )
          );

          res = await updateCourseAttendeeFiles({
            id: course.attending.id,
            fileUrls: urls,
          });
        } else {
          console.log("NEW");
          const urls = await Promise.all(
            vals.files.map((f: File) =>
              uploadToMinio("courses", `${user!.email}/${f.name}`, f)
            )
          );

          res = await createCourseAttendee({
            courseId: course.id,
            fileUrls: urls,
            billing: vals.billing,
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
                label={t("registration.billing.country", { ns: "conferences" })}
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
      <WizzardStep
        name="Dokumenty"
        yupSchema={yup.object({
          files: yup
            .array()
            .of(yup.mixed<File>().required())
            .min(1, (val) =>
              t("minFiles", { value: val.min, ns: "validation" })
            )
            .max(5, (val) =>
              t("maxFiles", { value: val.max, ns: "validation" })
            )
            .required(),
        })}
      >
        {(methods) => (
          <MultipleFileUploadField
            control={methods.control}
            setValue={methods.setValue}
            setError={methods.setError}
            label="CV, motivacny list, ine... (.pdf)"
            name="files"
            maxFiles={5}
            accept={{
              "application/pdf": [".pdf"],
            }}
            fileSources={{
              courses: course.attending?.fileUrls,
              resumes: !course.attending ? user?.cvUrl : undefined,
            }}
          />
        )}
      </WizzardStep>
    </WizzardForm>
  );
}
