"use client";

import Button from "@/components/Button";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { updateConferenceDates } from "../../../actions";
import { yupResolver } from "@hookform/resolvers/yup";
import { date, object, ref } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";

export default function UpdateDatesForm({
  lng,
  conference,
}: {
  lng: string;
  conference?: ConferenceFragment;
}) {
  const router = useRouter();
  const { t } = useTranslation(lng, "validation");

  const methods = useForm({
    values: {
      start: conference?.dates.start.toString().split(".")[0],
      end: conference?.dates.end.toString().split(".")[0],
      regEnd: conference?.dates.regEnd
        ? conference?.dates.regEnd.toString().split(".")[0]
        : null,
      submissionDeadline: conference?.dates.submissionDeadline
        ? conference?.dates.submissionDeadline.toString().split(".")[0]
        : null,
    },
    resolver: yupResolver(
      object({
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
      }).required()
    ),
  });

  const { dispatch } = useContext(MessageContext);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await updateConferenceDates(conference!.slug, data);

          if (state.message && !state.success) {
            dispatch({
              type: ActionTypes.SetFormMsg,
              payload: state,
            });
          }

          if (state.success) {
            dispatch({
              type: ActionTypes.SetAppMsg,
              payload: state,
            });
            router.back();
          }
        })}
      >
        <Input
          type="datetime-local"
          name="start"
          label="Zaciatok konferencie"
        />
        <Input type="datetime-local" name="end" label="Koniec konferencie" />
        <Input type="datetime-local" name="regEnd" label="Koniec registracie" />
        <Input
          type="datetime-local"
          name="submissionDeadline"
          label="Deadline odovzdania prispevkov"
        />

        <Button
          color="primary"
          type="submit"
          fluid
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting}
        >
          Aktualizovat datumy
        </Button>
      </form>
    </FormProvider>
  );
}
