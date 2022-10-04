import NextLink from "next/link";
import Image from "next/image";
import logo from "public/images/Flaw-logo-notext.png";

import InputField from "src/components/form/InputField";

import { LOGIN } from "src/graphql/Auth.graphql";
import { login, loginVariables } from "src/graphql/__generated__/login";
import { useMutation } from "@apollo/client";
import {
  Button,
  Form,
  Grid,
  Header,
  Input,
  Message,
  Segment,
} from "semantic-ui-react";
import { Formik, FormikProps } from "formik";
import { InferType } from "yup";
import { FC, useContext, useState } from "react";
import { ActionTypes, AuthContext } from "src/providers/Auth";
import { NextPage } from "next";
import { useRouter } from "next/router";

import Validation from "src/util/validation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Trans, useTranslation } from "next-i18next";
import LocalizedLink from "src/components/LocalizedLink";

const Login: NextPage = () => {
  const { dispatch } = useContext(AuthContext);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useTranslation("login");

  const { loginInputSchema } = Validation();

  type Values = InferType<typeof loginInputSchema>;

  const [login] = useMutation<login, loginVariables>(LOGIN, {
    onCompleted: ({ login }) => {
      dispatch({ type: ActionTypes.Login, payload: { user: login } });
      router.push("/");
    },
    onError: (err) => setError(err.message),
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
            <NextLink href="/">
              <Image
                alt="flaw-logo-notext"
                src={logo}
                height={48}
                width={48}
                priority={true}
              />
            </NextLink>
          </div>

          <Header as="h2" textAlign="center">
            {t("header")}
          </Header>
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={loginInputSchema}
            onSubmit={async (values, actions) => {
              await login({ variables: values });
            }}
          >
            {({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
              <>
                {error && (
                  <Message
                    error
                    content={error}
                    onDismiss={() => setError("")}
                  />
                )}
                <Form size="large" autoComplete="off" onSubmit={handleSubmit}>
                  <Segment>
                    <InputField
                      fluid
                      icon="user"
                      iconPosition="left"
                      placeholder={t("email.placeholder")}
                      label={t("email.label")}
                      name="email"
                      control={Input}
                    />
                    <div style={{ position: "relative" }}>
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
                      <div style={{ position: "absolute", top: 0, right: 0 }}>
                        <NextLink href="/forgotPassword">
                          {t("forgot")}
                        </NextLink>
                      </div>
                    </div>

                    <Button
                      fluid
                      size="large"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {t("submit")}
                    </Button>
                  </Segment>
                </Form>
              </>
            )}
          </Formik>

          <Message style={{ textAlign: "center" }}>
            <Trans
              i18nKey="message"
              t={t}
              components={{ lnk: <LocalizedLink href="/register" /> }}
            />
          </Message>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["login", "validation"])),
  },
});

export default Login;