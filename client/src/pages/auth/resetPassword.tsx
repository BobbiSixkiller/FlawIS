import { Formik, FormikProps } from "formik";
import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import logo from "public/images/Flaw-logo-notext.png";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

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
import { usePasswordResetMutation } from "../../graphql/generated/schema";
import { ActionTypes, AuthContext } from "../../providers/Auth";
import parseErrors from "../../util/parseErrors";
import Validation from "../../util/validation";

const ResetPassword: NextPage = () => {
  const { dispatch } = useContext(AuthContext);
  const router = useRouter();

  const [resetPass, { error }] = usePasswordResetMutation({
    context: {
      headers: {
        resettoken: router.query.token?.toString(),
      },
    },
    onCompleted: ({ passwordReset }) => {
      dispatch({ type: ActionTypes.Login, payload: { user: passwordReset } });
      router.push("/");
    },
  });

  const { passwordInputSchema } = Validation();
  type Values = InferType<typeof passwordInputSchema>;

  const { t } = useTranslation("resetPass");

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
            initialValues={{ password: "", repeatPass: "" }}
            validationSchema={passwordInputSchema}
            onSubmit={async (values, actions) => {
              try {
                await resetPass({
                  variables: { data: { password: values.password } },
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
              <Form size="large" onSubmit={handleSubmit}>
                <Segment>
                  <InputField
                    name="password"
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder={t("password.placeholder")}
                    type="password"
                    label={t("password.label")}
                    control={Input}
                  />

                  <InputField
                    name="repeatPass"
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder={t("password.placeholder")}
                    type="password"
                    label={t("repeatPass.placeholder")}
                    control={Input}
                  />

                  <Button
                    positive
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fluid
                    size="large"
                  >
                    Reset password
                  </Button>

                  {error && <Message error content={error.message} />}
                </Segment>
              </Form>
            )}
          </Formik>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["resetPass", "validation"])),
  },
});

export default ResetPassword;
