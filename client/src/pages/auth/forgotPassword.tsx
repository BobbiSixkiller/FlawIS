import { Formik, FormikProps } from "formik";
import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import Link from "next/link";
import logo from "public/images/Flaw-logo-notext.png";
import { Trans, useTranslation } from "react-i18next";

import {
  Button,
  Form,
  Grid,
  Header,
  Input,
  Message,
  Segment,
} from "semantic-ui-react";
import { InferType } from "yup";
import { InputField } from "../../components/form/InputField";
import LocalizedLink from "../../components/LocalizedLink";
import { useForgotPasswordLazyQuery } from "../../graphql/generated/schema";
import parseErrors from "../../util/parseErrors";
import Validation from "../../util/validation";

const ForgotPassword: NextPage = () => {
  const { t } = useTranslation("forgotPass");

  const [sendLink, { data, error }] = useForgotPasswordLazyQuery();

  const { forgotPasswordInputSchema } = Validation();
  type Values = InferType<typeof forgotPasswordInputSchema>;

  return (
    <Grid container centered>
      <Grid.Row>
        <Grid.Column style={{ maxWidth: 340 }}>
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
            {t("header")}
          </Header>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={forgotPasswordInputSchema}
            onSubmit={async (values, actions) => {
              try {
                await sendLink({ variables: { email: values.email } });
              } catch (error: any) {
                console.log(error);
                actions.setStatus(
                  parseErrors(
                    error.graphQLErrors[0].extensions.exception.validationErrors
                  )
                );
              }
            }}
          >
            {({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
              <Form size="large" onSubmit={handleSubmit}>
                <Segment>
                  <InputField
                    fluid
                    icon="at"
                    iconPosition="left"
                    placeholder={t("email.placeholder")}
                    label={t("email.label")}
                    name="email"
                    control={Input}
                  />
                  <Button
                    primary
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fluid
                    size="large"
                  >
                    {t("submit")}
                  </Button>
                  {error && <Message negative content={error.message} />}
                  {data && <Message positive content={data.forgotPassword} />}
                </Segment>
              </Form>
            )}
          </Formik>

          <Message style={{ textAlign: "center" }}>
            <Trans
              i18nKey="message"
              t={t}
              components={{ lnk: <LocalizedLink href="/login" /> }}
            />
          </Message>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["forgotPass", "validation"])),
  },
});

export default ForgotPassword;
