import { Formik, FormikProps } from "formik";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import logo from "public/images/Flaw-logo-notext.png";

import {
  Button,
  Form,
  Grid,
  Header,
  Input,
  Message,
  Segment,
} from "semantic-ui-react";
import { InferType, object, string } from "yup";
import { InputField } from "../../components/form/InputField";

const forgotPasswordInputSchema = object({
  email: string().required().email(),
});

type Values = InferType<typeof forgotPasswordInputSchema>;

const ForgotPassword: NextPage = () => {
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
            Reset your password
          </Header>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={forgotPasswordInputSchema}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                console.log(values);

                actions.setSubmitting(false);
              }, 1000);
            }}
          >
            {({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
              <Form size="large" onSubmit={handleSubmit}>
                <Segment>
                  <InputField
                    fluid
                    icon="at"
                    iconPosition="left"
                    placeholder="E-mail address"
                    label="Email"
                    name="email"
                    control={Input}
                  />

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fluid
                    size="large"
                  >
                    Send me a reset link
                  </Button>
                </Segment>
              </Form>
            )}
          </Formik>

          <Message style={{ textAlign: "center" }}>
            Or you remember it? <Link href="/login">Log in!</Link>
          </Message>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default ForgotPassword;
