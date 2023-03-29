import { Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import { Button, Form, Input } from "semantic-ui-react";
import { InferType, object, number, boolean, string } from "yup";
import { useAddMemberMutation } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import AutocompleteInputField from "./form/AutocompleteInputField";
import CheckboxField from "./form/CheckboxField";
import { InputField } from "./form/InputField";

const budgetInputSchema = object({
  user: string().required(),
  isMain: boolean().required(),
  hours: number().required(),
});

type Values = InferType<typeof budgetInputSchema>;

export default function AddTicketDialog() {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);
  const { query } = useRouter();
  const formikRef = useRef<FormikProps<Values>>(null);

  const [addMember] = useAddMemberMutation();

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
              initialValues={{ user: "", isMain: false, hours: 0 }}
              validationSchema={budgetInputSchema}
              onSubmit={async (values, formik) => {
                try {
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
                  <AutocompleteInputField
                    placeholder="Riešiteľ..."
                    label="Riešiteľ"
                    name="user"
                  />
                  <InputField
                    placeholder="Hodiny..."
                    label="Hodiny"
                    name="hours"
                    control={Input}
                    type="number"
                  />
                  <CheckboxField
                    name="isMain"
                    label={<label>Hlavný riešiteľ</label>}
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
