import { Formik, FormikProps } from "formik";
import { useContext } from "react";
import { Button, Form, Input, Select, TextArea } from "semantic-ui-react";
import { InferType, object, string, array } from "yup";
import {
  AnnouncementsDocument,
  FileType,
  useCreateAnnouncementMutation,
  useUploadFileMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";

import { InputField } from "./form/InputField";
import MultipleFileUploadField from "./form/Upload/MultipleFileUploadField";

const budgetInputSchema = object({
  name: string().required(),
  text: string().required(),
  files: array().test({
    message: "Pole musí obsahovať presne 3 súbory",
    test: (arr) => arr?.length === 3,
  }),
});

type Values = InferType<typeof budgetInputSchema>;

export default function AddAnnouncementDialog({
  grantId,
}: {
  grantId?: string;
}) {
  const { handleOpen, handleClose } = useContext(DialogContext);

  const [addAnnouncement] = useCreateAnnouncementMutation({
    refetchQueries: [{ query: AnnouncementsDocument }, "announcements"],
    onCompleted: () => handleClose(),
    update(cache, { data }) {
      if (grantId) {
        cache.modify({
          id: cache.identify({ __typename: "Grant", id: grantId }),
          fields: {
            announcements(existing) {
              return [...existing, data?.createAnnouncement];
            },
          },
        });
      }
    },
  });
  const [upload] = useUploadFileMutation();

  return (
    <Button
      positive
      floated="right"
      icon="plus"
      size="tiny"
      onClick={() =>
        handleOpen({
          size: "tiny",
          header: "Pridať oznam",
          content: (
            <Formik
              initialValues={
                {
                  name: "",
                  text: "",
                  files: [],
                  grantType: grantId ? undefined : "",
                } as Values
              }
              validationSchema={
                grantId
                  ? budgetInputSchema
                  : budgetInputSchema.concat(
                      object({ grantType: string().required() })
                    )
              }
              onSubmit={async (values, formik) => {
                console.log(values);
                try {
                  const urls: string[] = [];
                  for await (const file of values.files as File[]) {
                    const { data } = await upload({
                      variables: { file, type: FileType.Grant },
                    });
                    if (data) {
                      urls.push(data?.uploadFile);
                    }
                  }
                  console.log(urls);
                  await addAnnouncement({
                    variables: {
                      data: {
                        ...values,
                        grantId,
                        files: urls,
                      },
                    },
                  });
                } catch (error: any) {
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
                  {!grantId && (
                    <InputField
                      fluid
                      placeholder="Typ grantu..."
                      label="Typ grantu"
                      name="grantType"
                      control={Select}
                      options={[
                        { key: "0", text: "APVV", value: "APVV" },
                        { key: "1", text: "VEGA", value: "VEGA" },
                        { key: "2", text: "KEGA", value: "KEGA" },
                      ]}
                    />
                  )}
                  <InputField
                    fluid
                    placeholder="Názov oznamu..."
                    label="Názov"
                    name="name"
                    control={Input}
                  />
                  <InputField
                    fluid
                    placeholder="Text oznamu..."
                    label="Text"
                    name="text"
                    control={TextArea}
                  />
                  <MultipleFileUploadField
                    name="files"
                    label="Prílohy"
                    filetype={FileType.Image}
                    accept={{
                      "application/pdf": [],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [],
                    }}
                    maxFiles={3}
                    maxSize={100 * 1024}
                  />

                  <Button secondary onClick={() => handleClose()} type="button">
                    Zrušiť
                  </Button>
                  <Button positive type="submit">
                    Pridať
                  </Button>
                </Form>
              )}
            </Formik>
          ),
        })
      }
    />
  );
}
