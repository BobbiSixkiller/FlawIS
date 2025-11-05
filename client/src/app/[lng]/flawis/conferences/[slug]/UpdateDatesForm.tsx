"use client";

import Button from "@/components/Button";
import { date, object, ref } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { updateConferenceDates } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import RHFormContainer from "@/components/RHFormContainer";
import { formatDatetimeLocal } from "@/utils/helpers";

export default function UpdateDatesForm({
  conference,
  dialogId,
}: {
  conference: ConferenceFragment;
  dialogId: string;
}) {
  const { lng, slug } = useParams<{ lng: string; slug: string }>();
  const { t } = useTranslation(lng, "validation");

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <RHFormContainer
      defaultValues={{
        start: formatDatetimeLocal(
          conference.dates.start,
          true
        ) as unknown as Date,
        end: formatDatetimeLocal(conference.dates.end, true) as unknown as Date,
        regEnd: conference.dates.regEnd
          ? (formatDatetimeLocal(
              conference.dates.regEnd,
              true
            ) as unknown as Date)
          : null,
        submissionDeadline: conference.dates.submissionDeadline
          ? (formatDatetimeLocal(
              conference.dates.submissionDeadline,
              true
            ) as unknown as Date)
          : null,
      }}
      yupSchema={object({
        start: date().typeError(t("date")).required(t("required")),
        end: date()
          .typeError(t("date"))
          .min(ref("start"), t("endDateInvalid"))
          .required(t("required")),
        regEnd: date()
          .nullable()
          .default(null)
          .max(ref("start"), t("endDateInvalid")),
        submissionDeadline: date().nullable().default(null),
      })}
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
          <Input
            type="datetime-local"
            name="start"
            label="Zaciatok konferencie"
          />
          <Input type="datetime-local" name="end" label="Koniec konferencie" />
          <Input
            type="datetime-local"
            name="regEnd"
            label="Koniec registracie"
          />
          <Input
            type="datetime-local"
            name="submissionDeadline"
            label="Deadline odovzdania prispevkov"
          />

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
    </RHFormContainer>
  );
}
