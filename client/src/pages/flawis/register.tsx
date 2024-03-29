import { Formik, FormikProps } from "formik";
import { NextPage } from "next";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import logo from "public/images/Flaw-logo-notext.png";
import { useContext, useEffect } from "react";

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
import { User, useRegisterMutation } from "../../graphql/generated/schema";
import { ActionTypes, AuthContext } from "../../providers/Auth";
import parseErrors from "../../util/parseErrors";
import Validation from "../../util/validation";

const Register: NextPage = () => {
  const { dispatch, user } = useContext(AuthContext);
  const router = useRouter();
  const { t } = useTranslation("register");

  const { flawisRegisterInputSchema } = Validation();
  type Values = InferType<typeof flawisRegisterInputSchema>;

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const [register] = useRegisterMutation({
    onCompleted: ({ register }) => {
      dispatch({
        type: ActionTypes.Login,
        payload: { user: register as User },
      });
      router.push("/");
    },
  });

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
            initialValues={{
              name: "",
              email: "",
              password: "",
              repeatPass: "",
            }}
            validationSchema={flawisRegisterInputSchema}
            onSubmit={async (values, actions) => {
              try {
                await register({
                  variables: {
                    data: {
                      email: values.email,
                      name: values.name,
                      password: values.password,
                    },
                  },
                });
              } catch (err: any) {
                actions.setStatus(
                  parseErrors(
                    err.graphQLErrors[0].extensions.exception.validationErrors
                  )
                );
              }
            }}
          >
            {({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
              <Form size="large" autoComplete="off" onSubmit={handleSubmit}>
                <Segment>
                  <InputField
                    fluid
                    icon="user"
                    iconPosition="left"
                    placeholder={t("name.placeholder")}
                    label={t("name.label")}
                    name="name"
                    control={Input}
                  />

                  <InputField
                    fluid
                    icon="at"
                    iconPosition="left"
                    placeholder={t("email.placeholder")}
                    label={t("email.label")}
                    name="email"
                    control={Input}
                  />

                  <InputField
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder={t("password.placeholder")}
                    type="password"
                    label={t("password.label")}
                    name="password"
                    control={Input}
                  />

                  <InputField
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder={t("repeatPass.placeholder")}
                    type="password"
                    label={t("repeatPass.label")}
                    name="repeatPass"
                    control={Input}
                  />

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fluid
                    size="large"
                    positive
                  >
                    {t("submit")}
                  </Button>
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
    ...(await serverSideTranslations(locale, ["register", "validation"])),
  },
});

export default Register;
