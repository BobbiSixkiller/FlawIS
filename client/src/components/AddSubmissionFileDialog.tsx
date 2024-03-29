import { Formik, FormikProps } from "formik";
import { useContext, useRef } from "react";
import { Button, Form } from "semantic-ui-react";
import { DialogContext } from "../providers/Dialog";
import Validation from "../util/validation";
import { InferType } from "yup";
import parseErrors from "../util/parseErrors";
import {
  FileType,
  useAddSubmissionFileMutation,
} from "../graphql/generated/schema";
import { useTranslation } from "next-i18next";
import MultipleFileUploadField from "./form/Upload/MultipleFileUploadField";

export default function AddSubmissionFileDialog({ id }: { id: string }) {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);

  const { submissionFileSchema } = Validation();
  type Values = InferType<typeof submissionFileSchema>;

  const formikRef = useRef<FormikProps<Values>>(null);

  const { t } = useTranslation("conference");

  const [updateSubmission] = useAddSubmissionFileMutation();

  return (
    <Button
      positive
      floated="right"
      icon="inbox"
      content={t("dashboard.attendee.upload")}
      size="tiny"
      onClick={() =>
        handleOpen({
          size: "tiny",
          header: t("registration.submission.file.header"),
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
                files: [],
              }}
              validationSchema={submissionFileSchema}
              onSubmit={async (values, formik) => {
                try {
                  console.log(values);
                  await updateSubmission({
                    variables: {
                      id,
                      file: {
                        id: values.files[0].uploadedFile.id,
                        path: values.files[0].uploadedFile.path,
                      },
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
                  <MultipleFileUploadField
                    name="files"
                    label={t("registration.submission.file.label")}
                    filetype={FileType.Submission}
                    accept={{
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [],
                    }}
                    maxFiles={1}
                    maxSize={200 * 1024}
                  />
                </Form>
              )}
            </Formik>
          ),
        })
      }
    />
  );
}
