import { Formik, FormikProps } from "formik";
import { useTranslation } from "next-i18next";
import { useContext, useRef } from "react";
import { Button, Form, Input, TextArea } from "semantic-ui-react";
import { InferType, object, number, boolean, string, array } from "yup";
import { useAddTicketMutation } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import CheckboxField from "./form/CheckboxField";
import { InputField, LocalizedInputField } from "./form/InputField";

const ticketInputSchema = object({
  name: string().required(),
  description: string().required(),
  online: boolean().required(),
  withSubmission: boolean().required(),
  price: number().required(),
  translations: array()
    .of(
      object({
        language: string().required(),
        name: string().required(),
        description: string().required(),
      })
    )
    .required(),
});

type Values = InferType<typeof ticketInputSchema>;

export default function AddTicketDialog({ id }: { id: string }) {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);
  const formikRef = useRef<FormikProps<Values>>(null);

  const [addTicket] = useAddTicketMutation({
    update(cache, { data }) {
      cache.modify({
        id: cache.identify({ __ref: `Conference:${data?.addTicket.id}` }),
        fields: {
          tickets() {
            return data?.addTicket.tickets;
          },
        },
      });
    },
  });

  const { i18n } = useTranslation();

  return (
    <Button
      positive
      floated="right"
      icon="plus"
      size="tiny"
      onClick={() =>
        handleOpen({
          size: "tiny",
          header: "Pridať lístok",
          confirmText: "Pridať",
          cancelText: "Zrušiť",
          confirmCb: () => formikRef.current?.submitForm(),
          content: (
            <Formik
              innerRef={formikRef}
              initialValues={{
                name: "",
                description: "",
                online: false,
                withSubmission: false,
                price: 0,
                translations: [
                  {
                    language: i18n.language === "sk" ? "en" : "sk",
                    description: "",
                    name: "",
                  },
                ],
              }}
              validationSchema={ticketInputSchema}
              onSubmit={async (values, formik) => {
                try {
                  await addTicket({ variables: { id, data: values } });
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
                  <LocalizedInputField
                    placeholder="Name..."
                    label="Name"
                    name="name"
                    control={Input}
                    type="text"
                  />
                  <LocalizedInputField
                    placeholder="Description..."
                    label="Description"
                    name="description"
                    control={TextArea}
                    type="text"
                  />
                  <InputField
                    placeholder="Cena v centoch..."
                    label="Cena v centoch"
                    name="price"
                    control={Input}
                    type="number"
                  />
                  <CheckboxField name="online" label={<label>Online</label>} />
                  <CheckboxField
                    name="withSubmission"
                    label={<label>S príspevkom</label>}
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
