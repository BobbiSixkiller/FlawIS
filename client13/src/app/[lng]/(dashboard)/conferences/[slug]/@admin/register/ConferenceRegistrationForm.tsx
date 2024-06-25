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
  SubmissionInput,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import Ticket from "./Ticket";

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
  billings,
}: {
  lng: string;
  conference: ConferenceQuery["conference"];
  billings: UserFragment["billings"];
  submission?: SubmissionFragment;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { dispatch } = useContext(MessageContext);
  const [submissionStep, setSubmissionStep] = useState(false);

  const { t } = useTranslation(lng, ["validation", "conferences"]);

  return (
    <WizzardForm<AttendeeInput & { submission: SubmissionInput }>
      lng={lng}
      values={{
        conferenceId: conference.id,
        ticketId: "",
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
        const state = await addAttendee(
          {
            ticketId: data.ticketId,
            conferenceId: data.conferenceId,
            billing: data.billing,
          },
          searchParams.get("submission"),
          submissionStep ? data.submission : undefined
        );

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
          router.push(`/conferences/${conference.slug}`);
        }
      }}
    >
      <WizzardStep
        name={t("registration.billing.info", { ns: "conferences" })}
        validationSchema={object({
          billing: object({
            name: string().trim().required(t("required")),
            address: object({
              street: string().trim().required(t("required")),
              city: string().trim().required(t("required")),
              postal: string().trim().required(t("required")),
              country: string().trim().required(t("required")),
            }),
            ICO: string().trim(),
            DIC: string().trim(),
            ICDPH: string().trim(),
          }),
        })}
      >
        <BillingInput billings={billings} />
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
      </WizzardStep>
      <WizzardStep
        name={t("registration.ticket", { ns: "conferences" })}
        validationSchema={object({
          ticketId: string().required(t("ticket")),
        })}
      >
        <Ticket
          submission={submission}
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
          name={t("registration.submission.info", { ns: "conferences" })}
          validationSchema={object({
            submission: object({
              section: string().required(t("required")),
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
            disabled={submission !== undefined}
            name="submission.section"
            label={t("registration.submission.section", { ns: "conferences" })}
            options={conference.sections.map((s) => ({
              name: s.translations[lng as "sk" | "en"].name,
              value: s.id,
            }))}
            defaultSelected={submission?.section.id}
          />
          <LocalizedInput
            disabled={submission !== undefined}
            lng={lng}
            label={t("registration.submission.name", { ns: "conferences" })}
            name={`submission.translations.${lng}.name`}
          />
          <LocalizedTextarea
            disabled={submission !== undefined}
            lng={lng}
            label={t("registration.submission.abstract", { ns: "conferences" })}
            name={`submission.translations.${lng}.abstract`}
          />
          <LocalizedMultipleInput
            disabled={submission !== undefined}
            lng={lng}
            label={t("registration.submission.keywords.label", {
              ns: "conferences",
            })}
            placeholder={t("registration.submission.keywords.placeholder", {
              ns: "conferences",
            })}
            name={`submission.translations.${lng}.keywords`}
          />
          <MultipleInput
            disabled={submission !== undefined}
            label={t("registration.submission.authors.label", {
              ns: "conferences",
            })}
            placeholder={t("registration.submission.authors.placeholder", {
              ns: "conferences",
            })}
            name="submission.authors"
          />
        </WizzardStep>
      )}
    </WizzardForm>
  );
}
