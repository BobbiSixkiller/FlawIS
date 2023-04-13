import { Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import { Button, Form } from "semantic-ui-react";
import { DialogContext } from "../providers/Dialog";
import Validation from "../util/validation";
import { InferType } from "yup";
import parseErrors from "../util/parseErrors";
import {
  SubmissionInput,
  useAddSubmissionMutation,
  useConferenceQuery,
} from "../graphql/generated/schema";
import { RegisterSubmission } from "../pages/conferences/[slug]/register";
import { useTranslation } from "next-i18next";

export default function AddSubmissionDialog() {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);
  const { query } = useRouter();

  const { submissionInputSchema } = Validation();
  type Values = InferType<typeof submissionInputSchema>;

  const formikRef = useRef<FormikProps<Values>>(null);

  const { data, refetch } = useConferenceQuery({
    variables: { slug: query.slug as string },
  });

  const [registerSubmission] = useAddSubmissionMutation();

  const { t, i18n } = useTranslation("conference");

  return (
    <Button
      positive
      floated="right"
      icon="plus"
      size="tiny"
      onClick={() =>
        handleOpen({
          size: "tiny",
          header: t("registerSubmission"),
          confirmText: t("actions.save", {
            ns: "common",
          }),
          cancelText: t("actions.cancel", {
            ns: "common",
          }),
          confirmCb: () => formikRef.current?.submitForm(),
          content: (
            <Formik
              innerRef={formikRef}
              initialValues={{
                submission: {
                  abstract: "",
                  authors: [],
                  keywords: [],
                  name: "",
                  conferenceId: data?.conference.id,
                  sectionId: "",
                  translations: [
                    {
                      language: i18n.language === "sk" ? "en" : "sk",
                      name: "",
                      abstract: "",
                      keywords: [],
                    },
                  ],
                },
              }}
              validationSchema={submissionInputSchema}
              onSubmit={async (values, formik) => {
                try {
                  console.log(values);
                  await registerSubmission({
                    variables: {
                      data: values.submission,
                    },
                  });
                  await refetch();
                  handleClose();
                } catch (error: any) {
                  setError(error?.message || "");
                  formik.setStatus(
                    parseErrors(
                      error.graphQLErrors[0].extensions.exception
                        .validationErrors
                    )
                  );
                }
              }}
            >
              {({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
                <Form loading={isSubmitting} onSubmit={handleSubmit}>
                  <RegisterSubmission sections={data?.conference.sections} />
                </Form>
              )}
            </Formik>
          ),
        })
      }
    />
  );
}
