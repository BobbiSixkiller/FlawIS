"use client";
import { z } from "zod";

import { FormField, LocalizedFormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import {
  ConferenceQuery,
  PresentationLng,
  SubmissionFragment,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { addAttendee } from "./actions";
import Ticket from "./Ticket";

import GenericCombobox from "@/components/GenericCombobox";
import { Input } from "@/components/Input";
import Select from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import useValidation from "@/hooks/useValidation";
import { handleAPIErrors } from "@/lib/utilsClient";
import {
  conferenceWorkspaceHref,
  invitedTicketId,
} from "@/lib/conferenceRegistration";
import { useMessageStore } from "@/stores/messageStore";
import BillingInput from "./BillingInput";

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

  const [submissionStep, setSubmissionStep] = useState(!!submission);

  const { t } = useTranslation(lng, ["validation", "conferences"]);

  const { v } = useValidation();
  const setMessage = useMessageStore((s) => s.setMessage);

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
  const ticketSchema = z.object({
    conferenceId: v.string().min(1, v.required),
    ticketId: v.string().min(1, t("ticket")),
  });
  const submissionSchema = z.object({
    submission: z.object({
      conference: v.string().min(1, v.required),
      section: v.string().min(1, v.required),
      authors: z.array(v.string().email(v.email)).default([]),
      translations: z.object({
        sk: z.object({
          name: v.string().trim().min(1, v.required),
          abstract: v.string().trim().min(1, v.required),
          keywords: z
            .array(v.string().trim().min(1, v.required))
            .min(1, t("keywords", { value: 1 })),
        }),
        en: z.object({
          name: v.string().trim().min(1, v.required),
          abstract: v.string().trim().min(1, v.required),
          keywords: z
            .array(v.string().trim().min(1, v.required))
            .min(1, t("keywords", { value: 1 })),
        }),
      }),
      presentationLng: z.enum(PresentationLng, { error: v.required }),
    }),
  });
  const schema = z.intersection(
    z.intersection(billingSchema, ticketSchema),
    submissionStep
      ? submissionSchema
      : z.object({
          submission: z
            .custom<z.input<typeof submissionSchema>["submission"]>()
            .nullish(),
        }),
  );
  type FormValues = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;
  return (
    <WizzardForm
      schema={schema}
      lng={lng}
      values={{
        conferenceId: conference.id,
        ticketId: invitedTicketId(conference.tickets, Boolean(submission)),
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
              name: submission?.translations.en.name || "",
              abstract: submission?.translations.en.abstract || "",
              keywords: submission?.translations.en.keywords || [],
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
          searchParams.get("token"),
          submissionStep
            ? { data: submissionSchema.shape.submission.parse(data.submission) }
            : undefined,
        );

        if (res.errors) {
          handleAPIErrors(res.errors, methods.setError);
        }

        setMessage(res.message, res.success);

        if (res.success) {
          router.replace(conferenceWorkspaceHref(conference.slug));
        }
      }}
    >
      <WizzardStep<FormValues, FormOutput>
        name={t("registration.billing.info", { ns: "conferences" })}
        id="billing"
        fields={["billing"]}
      >
        {(methods) => (
          <div className="space-y-6">
            <FormField<FormValues, "billing.name">
              name="billing.name"
              label={t("registration.billing.name", { ns: "conferences" })}
            >
              {({ field, controlProps }) => (
                <BillingInput
                  billings={billings}
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
              label={t("registration.billing.country", { ns: "conferences" })}
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
          </div>
        )}
      </WizzardStep>
      <WizzardStep<FormValues, FormOutput>
        name={t("registration.ticket", { ns: "conferences" })}
        id="ticket"
        fields={["ticketId"]}
      >
        {(methods) => (
          <FormField<FormValues, "ticketId">
            name="ticketId"
            label="Forma ucasti"
          >
            {({ field, controlProps }) => (
              <Ticket
                {...field}
                {...controlProps}
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
            )}
          </FormField>
        )}
      </WizzardStep>
      {submissionStep && (
        <WizzardStep<FormValues, FormOutput>
          name={t("registration.submission.info", { ns: "conferences" })}
          id="submission"
          fields={["submission"]}
        >
          {(methods) => (
            <div className="space-y-6">
              <div
                role="note"
                className="rounded-md border border-primary-500 bg-primary-100 p-4 text-sm text-gray-900 dark:bg-primary-800 dark:text-white/85"
              >
                {t("registration.submission.notice", { ns: "conferences" })}
              </div>
              <FormField<FormValues, "submission.section">
                name="submission.section"
                label={t("registration.submission.section", {
                  ns: "conferences",
                })}
              >
                {({ field, controlProps }) => (
                  <Select
                    {...field}
                    {...controlProps}
                    disabled={submission !== undefined}
                    options={conference.sections.map((s) => ({
                      name: s.translations[lng as "sk" | "en"].name,
                      value: s.id,
                    }))}
                  />
                )}
              </FormField>
              <LocalizedFormField<
                FormValues,
                `submission.translations.${"sk" | "en"}.name`
              >
                lng={lng}
                name={`submission.translations.${lng as "sk" | "en"}.name`}
                label={t("registration.submission.name", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Textarea
                    {...field}
                    {...controlProps}
                    disabled={submission !== undefined}
                    value={field.value ?? ""}
                  />
                )}
              </LocalizedFormField>
              <LocalizedFormField<
                FormValues,
                `submission.translations.${"sk" | "en"}.abstract`
              >
                name={`submission.translations.${lng as "sk" | "en"}.abstract`}
                lng={lng}
                label={t("registration.submission.abstract", {
                  ns: "conferences",
                })}
              >
                {({ field, controlProps }) => (
                  <Textarea
                    {...field}
                    {...controlProps}
                    disabled={submission !== undefined}
                    value={field.value ?? ""}
                  />
                )}
              </LocalizedFormField>
              <LocalizedFormField<
                FormValues,
                `submission.translations.${"sk" | "en"}.keywords`
              >
                name={`submission.translations.${lng as "sk" | "en"}.keywords`}
                lng={lng}
                label={t("registration.submission.keywords.label", {
                  ns: "conferences",
                })}
              >
                {({ field, controlProps, onError, itemErrors }) => (
                  <GenericCombobox<{ id: number; val: string }, string>
                    {...field}
                    {...controlProps}
                    disabled={submission !== undefined}
                    lng={lng}
                    placeholder={t(
                      "registration.submission.keywords.placeholder",
                      {
                        ns: "conferences",
                      },
                    )}
                    multiple
                    allowCreateNewOptions
                    defaultOptions={[]}
                    getOptionLabel={(opt) => opt.val}
                    renderOption={(opt, props) => <span>{opt.val}</span>}
                    getOptionValue={(opt) => opt?.val ?? ""}
                    onError={onError}
                    itemErrors={itemErrors}
                  />
                )}
              </LocalizedFormField>
              <FormField<FormValues, "submission.presentationLng">
                name="submission.presentationLng"
                label={t("registration.submission.lng", { ns: "conferences" })}
              >
                {({ field, controlProps }) => (
                  <Select
                    {...field}
                    {...controlProps}
                    disabled={submission !== undefined}
                    options={[
                      { name: PresentationLng.Sk, value: PresentationLng.Sk },
                      { name: PresentationLng.Cz, value: PresentationLng.Cz },
                      { name: PresentationLng.En, value: PresentationLng.En },
                    ]}
                  />
                )}
              </FormField>
              <FormField<FormValues, "submission.authors">
                name="submission.authors"
                label={t("registration.submission.authors.label", {
                  ns: "conferences",
                })}
                description={t("registration.submission.authors.description", {
                  ns: "conferences",
                })}
              >
                {({ field, controlProps, onError, itemErrors }) => (
                  <GenericCombobox<{ id: number; val: string }, string>
                    {...field}
                    {...controlProps}
                    disabled={submission !== undefined}
                    placeholder={t(
                      "registration.submission.authors.placeholder",
                      {
                        ns: "conferences",
                      },
                    )}
                    lng={lng}
                    multiple
                    allowCreateNewOptions
                    defaultOptions={[]}
                    getOptionLabel={(opt) => opt.val}
                    renderOption={(opt, props) => <span>{opt.val}</span>}
                    getOptionValue={(opt) => opt?.val ?? ""}
                    onError={onError}
                    itemErrors={itemErrors}
                  />
                )}
              </FormField>
            </div>
          )}
        </WizzardStep>
      )}
    </WizzardForm>
  );
}
