import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { Grid, Header, Input, Message, Segment } from "semantic-ui-react";
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
  ConferenceDocument,
  Ticket,
  useConferenceQuery,
} from "../../../graphql/generated/schema";
import { NextPageContext } from "next";
import { addApolloState, initializeApollo } from "../../../lib/apollo";
import Validation from "../../../util/validation";
import BillingInput from "../../../components/form/BillingInput";
import { useContext, useRef } from "react";
import { AuthContext } from "../../../providers/Auth";
import RadioGroup from "../../../components/form/RadioGroup";
import { FormikBag } from "formik";

const RegisterAttendee: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { i18n, t } = useTranslation("conference");
  const formikRef = useRef<FormikBag<>>(null);

  const { data, error } = useConferenceQuery({
    variables: { slug: router.query.slug as string },
    onCompleted: ({ conference }) => {
      if (conference.attending) {
        router.replace(`/${router.query.slug}/dashboard`);
      }
    },
  });

  const { attendeeBillingInputSchema, ticketInputSchema } = Validation();

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
        <Wizzard
          innerRef={formikRef}
          goBackCb={() => router.push(`/${router.query.slug}`)}
          initialValues={{
            billing: {
              name: "",
              address: { street: "", city: "", postal: "", country: "" },
              ICO: "",
              DIC: "",
              ICDPH: "",
            },
            conference: { confereceId: "" },
            ticket: {
              id: "",
              name: "",
              description: "",
              online: false,
              withSubmission: false,
              price: 0,
            },
          }}
          onSubmit={async (values, formik) => {
            console.log(values);
            try {
            } catch (error: any) {
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
            <RadioGroup
              label="Select a ticket"
              name="ticket"
              options={data?.conference.tickets.map((t) => ({
                label: `${t.name} - ${t.description}`,
                value: t,
              }))}
            />
          </WizzardStep>
          {formikRef.current?.values.ticket.withSubmission && (
            <WizzardStep
              icon="inbox"
              title={t("registration.stepper.submission.title")}
              description={t("registration.stepper.submission.description")}
            ></WizzardStep>
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
    await client.query({
      query: ConferenceDocument,
      variables: { slug: query.slug?.toString() || "" },
    });

    return addApolloState(client, {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "conference",
        ])),
      },
    });
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "conference",
        ])),
      },
    };
  }
};

export default RegisterAttendee;
