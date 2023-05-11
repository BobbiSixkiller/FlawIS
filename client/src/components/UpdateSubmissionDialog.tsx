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
  useConferenceQuery,
  useUpdateSubmissionMutation,
} from "../graphql/generated/schema";
import { RegisterSubmission } from "../pages/conferences/[slug]/register";
import { useTranslation } from "next-i18next";

export default function UpdateSubmissionDialog({
  id,
  input,
}: {
  id: string;
  input: SubmissionInput;
}) {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);
  const { query } = useRouter();

  const { submissionInputSchema } = Validation();
  type Values = InferType<typeof submissionInputSchema>;

  const formikRef = useRef<FormikProps<Values>>(null);

  const { data } = useConferenceQuery({
    variables: { slug: query.slug as string },
  });

  const [update] = useUpdateSubmissionMutation();

  const { t } = useTranslation("conference");

  return (
    <Button
      primary
      size="tiny"
      icon="pencil alternate"
      onClick={() =>
        handleOpen({
          size: "tiny",
          header: t("editSubmission"),
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
                  userId: undefined,
                  conferenceId: data?.conference.id,
                  sectionId: input.sectionId,
                  name: input.name,
                  abstract: input.abstract,
                  keywords: input.keywords,
                  authors: [],
                  translations: input.translations,
                },
              }}
              validationSchema={submissionInputSchema}
              onSubmit={async (values, formik) => {
                try {
                  await update({
                    variables: {
                      id: id,
                      data: values.submission,
                    },
                  });
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
