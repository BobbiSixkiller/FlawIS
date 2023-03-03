import { Formik, FormikProps, useFormikContext } from "formik";
import { NextPage } from "next";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import logo from "public/images/Flaw-logo-notext.png";
import { FC, useContext, useEffect } from "react";

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
import CheckboxField from "../../components/form/CheckboxField";
import { InputField, InputFieldProps } from "../../components/form/InputField";
import LocalizedLink from "../../components/LocalizedLink";
import {
  useRegisterMutation,
  useUpdateConferenceUserMutation,
} from "../../graphql/generated/schema";
import { ActionTypes, AuthContext } from "../../providers/Auth";
import parseErrors from "../../util/parseErrors";
import Validation from "../../util/validation";

const EmailField: FC<InputFieldProps> = (props) => {
  const { conferencesRegisterInputSchme } = Validation();
  type Values = InferType<typeof conferencesRegisterInputSchme>;

  const { values, setFieldValue, errors, touched } = useFormikContext<Values>();

  useEffect(() => {
    if (
      touched["email"] &&
      !errors["email"] &&
      values["email"].split("@")[1] === "flaw.uniba.sk"
    ) {
      setFieldValue(
        "organisation",
        "Univerzita Komenského v Bratislave, Právnická fakulta"
      );
    }
  }, [values, setFieldValue, errors, touched]);

  return <InputField {...props} />;
};

const Register: NextPage = () => {
  const { dispatch } = useContext(AuthContext);
  const router = useRouter();

  const { conferencesRegisterInputSchme } = Validation();
  type Values = InferType<typeof conferencesRegisterInputSchme>;

  const [register] = useRegisterMutation({
    onCompleted: ({ register }) => {
      dispatch({ type: ActionTypes.Login, payload: { user: register } });
    },
  });

  const [updateConferenceUser] = useUpdateConferenceUserMutation();

  const { t } = useTranslation("register");

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
              organisation: "",
              telephone: "",
              password: "",
              repeatPass: "",
              terms: false,
            }}
            validationSchema={conferencesRegisterInputSchme}
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
                await updateConferenceUser({
                  variables: {
                    data: {
                      organisation: values.organisation,
                      telephone: values.telephone,
                    },
                  },
                });
                router.push("/");
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

                  <EmailField
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
                    icon="phone"
                    iconPosition="left"
                    placeholder={t("phone.placeholder")}
                    label={t("phone.label")}
                    name="telephone"
                    control={Input}
                  />

                  <InputField
                    fluid
                    icon="building"
                    iconPosition="left"
                    placeholder={t("organisation.placeholder")}
                    label={t("organisation.label")}
                    name="organisation"
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

                  <CheckboxField
                    name="terms"
                    label={
                      <label>
                        <Trans
                          i18nKey="terms"
                          t={t}
                          components={{
                            lnk: (
                              <LocalizedLink href="https://uniba.sk/en/privacy-policy/" />
                            ),
                          }}
                        />
                      </label>
                    }
                  />

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fluid
                    size="large"
                  >
                    Register
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
