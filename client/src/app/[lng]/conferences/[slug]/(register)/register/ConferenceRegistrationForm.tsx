"use client";

import { WizzardForm, WizzardStep } from "@/components/WIzzardForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { useState } from "react";
import { addAttendee } from "./actions";
import {
  AttendeeInput,
  ConferenceQuery,
  PresentationLng,
  SubmissionFragment,
  SubmissionInput,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import Ticket from "./Ticket";

import BillingInput from "./BillingInput";
import { LocalizedTextarea } from "@/components/Textarea";
import { Input } from "@/components/Input";
import {
  LocalizedMultipleInput,
  MultipleInput,
} from "@/components/MultipleInput";
import Select from "@/components/Select";
import useValidation from "@/hooks/useValidation";
import { useMessageStore } from "@/stores/messageStore";

export default function ConferenceRegistrationForm({
  lng,
  conference,
  submission,
  billings,
  ticketId,
}: {
  lng: string;
  conference: ConferenceQuery["conference"];
  billings: UserFragment["billings"];
  submission?: SubmissionFragment;
  ticketId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submissionStep, setSubmissionStep] = useState(!!ticketId);

  const { t } = useTranslation(lng, ["validation", "conferences"]);

  const { yup } = useValidation();
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <WizzardForm<AttendeeInput & { submission: SubmissionInput }>
      lng={lng}
      values={{
        conferenceId: conference.id,
        ticketId,
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
          section: submission?.section.id || "",
          presentationLng: (submission?.presentationLng ||
            "") as PresentationLng,
        },
      }}
      onSubmitCb={async (data, methods) => {
        const res = await addAttendee(
          {
            ticketId: data.ticketId,
            conferenceId: data.conferenceId,
            billing: data.billing,
          },
          searchParams.get("submission"),
          searchParams.get("token"),
          submissionStep
            ? { data: data.submission, ticketId: data.ticketId }
            : undefined
        );

        if (res.errors) {
          console.log(res.errors);
          for (const [key, val] of Object.entries(res.errors)) {
            methods.setError(key, { message: val }, { shouldFocus: true });
          }
        }

        setMessage(res.message, res.success);

        if (res.success) {
          router.push(`/${conference.slug}`);
        }
      }}
    >
      <WizzardStep
        name={t("registration.billing.info", { ns: "conferences" })}
        validationSchema={yup.object({
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
        validationSchema={yup.object({
          ticketId: yup.string().required(t("ticket")),
        })}
      >
        <Ticket
          // submission={submission}
          disabled={!!submission}
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
          validationSchema={yup.object({
            submission: yup.object({
              section: yup.string().required(),
              authors: yup.array().of(yup.string().email()),
              translations: yup.object({
                sk: yup.object({
                  name: yup.string().trim().required(),
                  abstract: yup.string().trim().required(),
                  keywords: yup
                    .array()
                    .of(yup.string().required().trim())
                    .min(1, (val) => t("keywords", { value: val.min }))
                    .required(),
                }),
                en: yup.object({
                  name: yup.string().trim().required(),
                  abstract: yup.string().trim().required(),
                  keywords: yup
                    .array()
                    .of(yup.string().required().trim())
                    .min(1, (val) => t("keywords", { value: val.min }))
                    .required(),
                }),
              }),
              presentationLng: yup.string<PresentationLng>().required(),
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
          />
          <LocalizedTextarea
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
          <Select
            disabled={submission !== undefined}
            name="submission.presentationLng"
            label={t("registration.submission.lng", { ns: "conferences" })}
            options={[
              { name: PresentationLng.Sk, value: PresentationLng.Sk },
              { name: PresentationLng.Cz, value: PresentationLng.Cz },
              { name: PresentationLng.En, value: PresentationLng.En },
            ]}
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
