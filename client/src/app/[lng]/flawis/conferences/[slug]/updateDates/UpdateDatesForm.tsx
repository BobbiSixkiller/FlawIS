"use client";

import Button from "@/components/Button";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { date, object, ref } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { updateConferenceDates } from "./actions";
import { FormMessage } from "@/components/Message";
import Spinner from "@/components/Spinner";

export default function UpdateDatesForm({
  lng,
  conference,
}: {
  lng: string;
  conference?: ConferenceFragment;
}) {
  const router = useRouter();
  const { t } = useTranslation(lng, "validation");

  function setDefaultVal(utc: string) {
    const date = new Date(utc);
    date.setHours(date.getHours() + 2);

    return date.toISOString().slice(0, 16);
  }

  const methods = useForm({
    defaultValues: {
      start: setDefaultVal(conference?.dates.start) as unknown as Date,
      end: setDefaultVal(conference?.dates.end) as unknown as Date,
      regEnd: conference?.dates.regEnd
        ? (setDefaultVal(conference?.dates.regEnd) as unknown as Date)
        : null,
      submissionDeadline: conference?.dates.submissionDeadline
        ? (setDefaultVal(
            conference?.dates.submissionDeadline
          ) as unknown as Date)
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
          console.log(data.submissionDeadline);
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
        <FormMessage />

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
    </FormProvider>
  );
}
