"use client";

import { WizzardForm, WizzardStep } from "@/components/WIzzardForm";
import { useRouter, useSearchParams } from "next/navigation";
import { array, object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import { useContext, useState } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { addAttendee } from "./actions";
import {
  AttendeeInput,
  ConferenceQuery,
  SubmissionFragment,
} from "@/lib/graphql/generated/graphql";
import Ticket from "./Ticket";

import useUser from "@/hooks/useUser";
import BillingInput from "./BillingInput";
import { LocalizedTextarea } from "@/components/Textarea";
import { Input, LocalizedInput } from "@/components/Input";
import {
  LocalizedMultipleInput,
  MultipleInput,
} from "@/components/MultipleInput";
import Select from "@/components/Select";

export default function ConferenceRegistrationForm({
  lng,
  conference,
  submission,
}: {
  lng: string;
  conference: ConferenceQuery["conference"];
  submission?: SubmissionFragment;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { dispatch } = useContext(MessageContext);
  const [submissionStep, setSubmissionStep] = useState(false);

  const { t } = useTranslation(lng, "validation");

  const user = useUser();

  return (
    <WizzardForm<AttendeeInput>
      lng={lng}
      values={{
        conferenceId: conference.id,
        ticketId: "",
        submissionId: searchParams.get("submission"),
        billing: {
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
        submission: {
          translations: {
            sk: {
              name: submission?.translations.sk.name || "",
              abstract: submission?.translations.sk.abstract || "",
              keywords: submission?.translations.sk.keywords || [],
            },
            en: {
              name: submission?.translations.sk.name || "",
              abstract: submission?.translations.sk.abstract || "",
              keywords: submission?.translations.sk.keywords || [],
            },
          },
          authors: [],
          conference: conference.id,
          section: submission?.section || "",
        },
      }}
      onSubmitCb={async (data) => {
        console.log(data);
        const state = await addAttendee(conference.slug, data.attendee);

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
      }}
    >
      <WizzardStep
        name="Fakturacne udaje"
        validationSchema={object({
          billing: object({
            name: string().trim().required(t("required")),
            address: object({
              street: string().trim().required(t("required")),
              city: string().trim().required(t("required")),
              postal: string().trim().required(t("required")),
              country: string().trim().required(t("required")),
            }),
            ICO: string().trim().required(t("required")),
            DIC: string().trim().required(t("required")),
            ICDPH: string().trim().required(t("required")),
          }),
        })}
      >
        <BillingInput billings={user?.billings} />
        <Input label="Ulica" name="billing.address.street" />
        <Input label="Mesto" name="billing.address.city" />
        <Input label="PSC" name="billing.address.postal" />
        <Input label="Krajina" name="billing.address.country" />
        <Input label="ICO" name="billing.ICO" />
        <Input label="DIC" name="billing.DIC" />
        <Input label="ICDPH" name="billing.ICDPH" />
      </WizzardStep>
      <WizzardStep
        name="Forma ucasti"
        validationSchema={object({ ticketId: string().required(t("ticket")) })}
      >
        <Ticket
          setSubmission={setSubmissionStep}
          tickets={conference.tickets.map((t) => ({
            id: t.id,
            name: t.translations[lng as "sk" | "en"].name,
            desc: t.translations[lng as "sk" | "en"].description,
            price: t.price / 100,
            withSubmission: t.withSubmission,
          }))}
        />
      </WizzardStep>
      {submissionStep && (
        <WizzardStep
          name="Prispevok"
          validationSchema={object({
            submission: object({
              sectionId: string().required(t("required")),
              authors: array().of(string().email()),
              translations: object({
                sk: object({
                  name: string().trim().required(t("required")),
                  abstract: string().trim().required(t("required")),
                  keywords: array()
                    .of(string().required().trim())
                    .min(1, (val) => t("keywords", { value: val.min }))
                    .required(),
                }),
                en: object({
                  name: string().trim().required(t("required")),
                  abstract: string().trim().required(t("required")),
                  keywords: array()
                    .of(string().required().trim())
                    .min(1, (val) => t("keywords", { value: val.min }))
                    .required(),
                }),
              }),
            }),
          })}
        >
          <Select
            name="submission.sectionId"
            label="Sekcia"
            options={conference.sections.map((s) => ({
              name: s.translations[lng as "sk" | "en"].name,
              value: s.id,
            }))}
          />
          <LocalizedInput
            disabled={searchParams.get("submission") !== null}
            lng={lng}
            label="Nazov prispevku"
            name={`submission.translations.${lng}.name`}
          />
          <LocalizedTextarea
            disabled={searchParams.get("submission") !== null}
            lng={lng}
            label="Abstrakt prispevku"
            name={`submission.translations.${lng}.abstract`}
          />
          <LocalizedMultipleInput
            disabled={searchParams.get("submission") !== null}
            lng={lng}
            label="Keywords"
            name={`submission.translations.${lng}.keywords`}
          />
          <MultipleInput label="Authors" name="submission.authors" />
        </WizzardStep>
      )}
    </WizzardForm>
  );
}
