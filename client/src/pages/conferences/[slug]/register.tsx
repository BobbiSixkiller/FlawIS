import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Form,
  Grid,
  Header,
  Input,
  Label,
  Message,
  Radio,
  Select,
  SelectProps,
  TextArea,
} from "semantic-ui-react";
import {
  InputField,
  LocalizedInputField,
} from "../../../components/form/InputField";
import { Wizzard, WizzardStep } from "../../../components/form/Wizzard";
import parseErrors from "../../../util/parseErrors";
import { NextPageWithLayout } from "../../_app";

import logo from "public/images/Flaw-logo-notext.png";
import Image from "next/image";
import {
  AttendeeInput,
  ConferenceDocument,
  Section,
  useAddAttendeeMutation,
  useConferenceQuery,
  useSubmissionLazyQuery,
} from "../../../graphql/generated/schema";
import { NextPageContext } from "next";
import { addApolloState, initializeApollo } from "../../../lib/apollo";
import Validation from "../../../util/validation";
import BillingInput from "../../../components/form/BillingInput";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../providers/Auth";
import { useField, useFormikContext } from "formik";

function SelectTicket({
  label,
  name,
  setSubmissionRegistration,
}: {
  label: string;
  name: string;
  setSubmissionRegistration: (withSubmission: boolean) => void;
}) {
  const [field, meta, _helpers] = useField(name);
  const { setFieldValue } = useFormikContext();
  const { i18n } = useTranslation();
  const router = useRouter();

  const { data, error } = useConferenceQuery({
    variables: { slug: router.query.slug as string },
  });

  if (!data || error) {
    return null;
  }

  return (
    <Form.Field error={meta.error && meta.touched}>
      <label>{label}</label>
      {data.conference.tickets.map((ticket) => (
        <Form.Field key={ticket.id}>
          <Radio
            label={`${ticket.name} - ${ticket.description} - ${
              ticket.price / 100
            } €`}
            disabled={
              router.query.submission !== undefined && !ticket.withSubmission
            }
            name={name}
            value={ticket.name}
            checked={field.value === ticket.id}
            onChange={() => {
              if (ticket.withSubmission) {
                setFieldValue("submission", {
                  conferenceId: data.conference.id,
                  sectionId: "",
                  name: "",
                  abstract: "",
                  keywords: [],
                  authors: [],
                  translations: [
                    {
                      language: i18n.language === "sk" ? "en" : "sk",
                      name: "",
                      abstract: "",
                      keywords: [],
                    },
                  ],
                });
              }
              setFieldValue("ticketId", ticket.id);
            }}
            onClick={() => setSubmissionRegistration(ticket.withSubmission)}
          />
        </Form.Field>
      ))}
      {meta.touched && meta.error && (
        <Label prompt pointing>
          {meta.error}
        </Label>
      )}
    </Form.Field>
  );
}

export function RegisterSubmission({
  sections,
}: {
  sections?: Pick<Section, "id" | "name" | "description" | "languages">[];
}) {
  const router = useRouter();
  const { values, setFieldValue } = useFormikContext<{
    submission: any;
  }>();
  const [options, setOptions] = useState(
    values.submission.keywords.map((w: any, i: number) => ({
      key: i,
      text: w,
      value: w,
    }))
  );
  const [localizedOptions, setLocalizedOptions] = useState(
    values.submission.translations[0].keywords.map((w: any, i: number) => ({
      key: i,
      text: w,
      value: w,
    }))
  );
  const [authors, setAuthors] = useState(
    values.submission.authors.map((w: any, i: number) => ({
      key: i,
      text: w,
      value: w,
    }))
  );

  const { t } = useTranslation("conference");

  const [loadSubmission] = useSubmissionLazyQuery({
    onCompleted: ({ submission }) => {
      setFieldValue(
        "submission",
        {
          conferenceId: submission.conference.id,
          sectionId: submission.section.id,
          name: submission.name,
          abstract: submission.abstract,
          keywords: submission.keywords,
          authors: [],
          translations: submission.translations.map((t) => ({
            language: t.language,
            name: t.name,
            abstract: t.abstract,
            keywords: t.keywords,
          })),
        },
        true
      );
    },
  });

  useEffect(() => {
    if (router.query.submission !== undefined) {
      loadSubmission({
        variables: { id: router.query.submission as string },
      });
    }
  }, [router]);

  return (
    <>
      <InputField
        disabled={router.query.submission !== undefined}
        name="submission.sectionId"
        label="Section"
        placeholder="Choose a section"
        search
        searchInput={{
          name: "submission.sectionId",
          id: "form-control-section",
        }}
        control={Select}
        options={sections?.map((s) => ({
          key: s.id,
          text: s.name,
          value: s.id,
        }))}
      />
      <LocalizedInputField
        disabled={router.query.submission !== undefined}
        name="submission.name"
        label={t("registration.submission.name.label")}
        placeholder={t("registration.submission.name.placeholder")}
        type="text"
        control={Input}
      />
      <LocalizedInputField
        disabled={router.query.submission !== undefined}
        name="submission.abstract"
        label={t("registration.submission.abstract.label")}
        placeholder={t("registration.submission.abstract.placeholder")}
        type="text"
        control={TextArea}
      />
      <LocalizedInputField
        disabled={router.query.submission !== undefined}
        name="submission.keywords"
        label={t("registration.submission.keywords.label")}
        placeholder={t("registration.submission.keywords.placeholder")}
        noResultsMessage={t("actions.noResults", { ns: "common" })}
        additionLabel={t("actions.add", { ns: "common" }) + " "}
        control={Select}
        allowAdditions
        multiple
        search
        searchInput={{
          name: "submission.keywords",
          id: "form-control-keywords",
        }}
        value={values.submission.keywords.map((k: any, i: number) => ({
          key: i,
          text: k,
          value: k,
        }))}
        options={options}
        onAddItem={(e: SyntheticEvent, { value }: SelectProps) => {
          setOptions((prev: any) =>
            Array.from(
              new Set([...prev]).add({
                key: prev.length,
                text: value as string,
                value: value as string,
              })
            )
          );
          setFieldValue(
            "submission.keywords",
            Array.from(new Set([...values.submission.keywords]).add(value))
          );
        }}
        localizedOptions={localizedOptions}
        onAddItemLocalized={(e: SyntheticEvent, { value }: SelectProps) => {
          setLocalizedOptions((prev: any) =>
            Array.from(
              new Set([...prev]).add({
                key: prev.length,
                text: value as string,
                value: value as string,
              })
            )
          );
          setFieldValue(
            "submission.translations[0].keywords",
            Array.from(
              new Set([...values.submission.translations[0].keywords]).add(
                value
              )
            )
          );
        }}
      />
      <InputField
        disabled={router.query.submission !== undefined}
        name="submission.authors"
        label={t("registration.submission.authors.label")}
        placeholder={t("registration.submission.authors.placeholder")}
        noResultsMessage={t("actions.noResults", { ns: "common" })}
        additionLabel={t("actions.add", { ns: "common" }) + " "}
        control={Select}
        allowAdditions
        multiple
        search
        searchInput={{
          name: "submission.keywords",
          id: "form-control-keywords",
        }}
        options={authors}
        onAddItem={(e: SyntheticEvent, { value }: SelectProps) => {
          setAuthors((prev: any) =>
            Array.from(
              new Set([...prev]).add({
                key: prev.length,
                text: value as string,
                value: value as string,
              })
            )
          );
          setFieldValue(
            "submission.authors",
            Array.from(new Set([...values.submission.authors]).add(value))
          );
        }}
      />

      <Message info content={t("registration.submission.message")} />
    </>
  );
}

const RegisterAttendee: NextPageWithLayout = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { t } = useTranslation("conference");
  const [submissionRegistration, setSubmissionRegistration] = useState(false);

  const {
    attendeeBillingInputSchema,
    ticketInputSchema,
    submissionInputSchema,
  } = Validation();

  const { data, error } = useConferenceQuery({
    variables: { slug: router.query.slug as string },
  });

  const [register] = useAddAttendeeMutation();

  return (
    <Grid centered padded>
      <Grid.Column computer={8} tablet={10} mobile={16}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            paddingTop: "32px",
            cursor: "pointer",
          }}
        >
          <Link href="/">
            <Image
              alt="flaw-logo-notext"
              src={logo}
              height={48}
              width={48}
              priority={true}
            />
          </Link>
        </div>
        <Header as="h2" textAlign="center">
          {t("registration.header") + " " + data?.conference.name}
        </Header>
        {error && <Message error content={error.message} />}
        {errorMsg && <Message error content={errorMsg} />}
        <Wizzard
          goBackCb={() => router.push(`/${router.query.slug}`)}
          initialValues={{
            billing: {
              name: "",
              address: { street: "", city: "", postal: "", country: "" },
              ICO: "",
              DIC: "",
              ICDPH: "",
            },
            conferenceId: "",
            ticketId: "",
            submissionId: router.query.submission as string,
          }}
          onSubmit={async (values, formik) => {
            try {
              await register({
                variables: {
                  data: {
                    ...values,
                    ticketId: values.ticketId,
                    conferenceId: data?.conference.id,
                  } as AttendeeInput,
                },
                update(cache, { data }) {
                  cache.modify({
                    id: `Conference:${data?.addAttendee.conference.id}`,
                    fields: {
                      attending() {
                        return data?.addAttendee;
                      },
                    },
                  });
                },
              });

              router.push(`/${router.query.slug}/dashboard`);
            } catch (error: any) {
              console.log(error);
              setErrorMsg(error.message);
              formik.setStatus(
                parseErrors(
                  error.graphQLErrors[0].extensions.exception.validationErrors
                )
              );
            }
          }}
        >
          <WizzardStep
            icon="money"
            title={t("registration.stepper.billing.title")}
            description={t("registration.stepper.billing.description")}
            validationSchema={attendeeBillingInputSchema}
          >
            <BillingInput
              placeholder={t("registration.billing.name.placeholder")}
              label={t("registration.billing.name.label")}
              name="billing.name"
              data={user!.billings}
            />
            <InputField
              placeholder={t("registration.billing.street.placeholder")}
              label={t("registration.billing.street.label")}
              name="billing.address.street"
              control={Input}
              type="text"
            />
            <InputField
              placeholder={t("registration.billing.city.placeholder")}
              label={t("registration.billing.city.label")}
              name="billing.address.city"
              control={Input}
              type="text"
            />
            <InputField
              placeholder={t("registration.billing.postal.placeholder")}
              label={t("registration.billing.postal.label")}
              name="billing.address.postal"
              control={Input}
              type="text"
            />
            <InputField
              placeholder={t("registration.billing.country.placeholder")}
              label={t("registration.billing.country.label")}
              name="billing.address.country"
              control={Input}
              type="text"
            />
            <InputField
              placeholder={t("registration.billing.ICO.placeholder")}
              label={t("registration.billing.ICO.label")}
              name="billing.ICO"
              control={Input}
              type="text"
            />
            <InputField
              placeholder={t("registration.billing.DIC.placeholder")}
              label={t("registration.billing.DIC.label")}
              name="billing.DIC"
              control={Input}
              type="text"
            />
            <InputField
              placeholder={t("registration.billing.ICDPH.placeholder")}
              label={t("registration.billing.ICDPH.label")}
              name="billing.ICDPH"
              control={Input}
              type="text"
            />
          </WizzardStep>
          <WizzardStep
            icon="ticket"
            title={t("registration.stepper.tickets.title")}
            description={t("registration.stepper.tickets.description")}
            validationSchema={ticketInputSchema}
          >
            <SelectTicket
              label={t("registration.tickets.label")}
              name="ticketId"
              setSubmissionRegistration={setSubmissionRegistration}
            />
          </WizzardStep>
          {submissionRegistration && (
            <WizzardStep
              icon="inbox"
              title={t("registration.stepper.submission.title")}
              description={t("registration.stepper.submission.description")}
              validationSchema={submissionInputSchema}
            >
              <RegisterSubmission sections={data?.conference.sections} />
            </WizzardStep>
          )}
        </Wizzard>
      </Grid.Column>
    </Grid>
  );
};

export const getServerSideProps = async ({
  locale,
  req,
  query,
}: NextPageContext) => {
  const client = initializeApollo({ headers: { ...req?.headers } });

  try {
    const { data } = await client.query({
      query: ConferenceDocument,
      variables: { slug: query.slug?.toString() || "" },
    });

    if (data && data.conference.attending) {
      return {
        redirect: {
          permanent: false,
          destination: `/${locale}/${data.conference.slug}/dashboard`,
        },
      };
    }

    return addApolloState(client, {
      props: {
        protect: true,
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "conference",
          "activation",
        ])),
      },
    });
  } catch (error) {
    return {
      props: {
        protect: true,
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "conference",
          "activation",
        ])),
      },
    };
  }
};

export default RegisterAttendee;
