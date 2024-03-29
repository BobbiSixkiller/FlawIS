import { Formik, FormikProps } from "formik";
import { useContext } from "react";
import { Button, Form, Input, Select, TextArea } from "semantic-ui-react";
import { date, InferType, object, ref, string } from "yup";
import {
  GrantsDocument,
  GrantType,
  useCreateGrantMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import { InputField } from "./form/InputField";

const grantInputSchema = object({
  name: string().required(),
  type: string().required(),
  start: date().required(),
  end: date()
    .min(ref("start"), "end date can't be before start date")
    .required(),
});

type Values = InferType<typeof grantInputSchema>;

function AddGrant() {
  const { handleClose, setError } = useContext(DialogContext);

  const [addGrant] = useCreateGrantMutation({
    onCompleted: () => handleClose(),
    onError: (err) => setError(err.message),
    refetchQueries: [{ query: GrantsDocument }, "grants"],
  });

  return (
    <Formik
      initialValues={{
        name: "",
        type: "",
        start: new Date("yyyy-MM-dd"),
        end: new Date("yyyy-MM-dd"),
      }}
      validationSchema={grantInputSchema}
      onSubmit={async (values, formik) => {
        console.log(values);
        try {
          await addGrant({
            variables: {
              data: {
                name: values.name,
                type: values.type as GrantType,
                start: values.start,
                end: values.end,
              },
            },
          });
        } catch (error: any) {
          formik.setStatus(
            parseErrors(
              error.graphQLErrors[0].extensions.exception.validationErrors
            )
          );
        }
      }}
    >
      {({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
        <Form loading={isSubmitting} onSubmit={handleSubmit}>
          <InputField
            placeholder="Názov grantu..."
            label="Názov grantu"
            name="name"
            control={TextArea}
          />
          <InputField
            fluid
            placeholder="Typ grantu..."
            label="Typ grantu"
            name="type"
            control={Select}
            options={[
              { key: "0", text: "APVV", value: "APVV" },
              { key: "1", text: "VEGA", value: "VEGA" },
              { key: "2", text: "KEGA", value: "KEGA" },
            ]}
          />
          <InputField
            fluid
            placeholder="Začiatok grantu..."
            label="Začiatok grantu"
            name="start"
            control={Input}
            type="date"
          />
          <InputField
            fluid
            placeholder="Koniec grantu..."
            label="Koniec grantu"
            name="end"
            control={Input}
            type="date"
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
  );
}

export default function AddGrantDialog() {
  const { handleOpen } = useContext(DialogContext);

  return (
    <Button
      positive
      floated="right"
      icon="plus"
      onClick={() =>
        handleOpen({
          content: <AddGrant />,
          size: "tiny",
          header: "Nový grant",
        })
      }
    />
  );
}
