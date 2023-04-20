import { Formik, FormikProps } from "formik";
import { ReactElement } from "react";
import { Button, Form } from "semantic-ui-react";
import { InferType, number, object, string } from "yup";
import { Invoice } from "../graphql/generated/schema";
import removeTypename from "../util/removeTypename";

const invoiceInputSchema = object({
  issuer: object({
    name: string().trim().required(),
    address: object({
      street: string().trim().required(),
      city: string().trim().required(),
      postal: string().trim().required(),
      country: string().trim().required(),
    }),
    variableSymbol: string().trim().required(),
    IBAN: string().trim().required(),
    SWIFT: string().trim().required(),
    ICO: string().trim().required(),
    DIC: string().trim().required(),
    ICDPH: string().trim().required(),
  }),
  payer: object({
    name: string().trim().required(),
    address: object({
      street: string().trim().required(),
      city: string().trim().required(),
      postal: string().trim().required(),
      country: string().trim().required(),
    }),
    ICO: string().trim().required(),
    DIC: string().trim().required(),
    ICDPH: string().trim().required(),
  }),
  body: object({
    body: string().trim().required(),
    comment: string().trim().required(),
    dueDate: string().trim().required(),
    issueDate: string().trim().required(),
    price: number().required(),
    type: string().trim().required(),
    vat: number().required(),
    vatDate: string().trim().required(),
  }),
});

type Values = InferType<typeof invoiceInputSchema>;

export default function UpdateInvoiceForm({
  data,
  downloadLink,
}: {
  data?: Invoice;
  downloadLink: ReactElement;
}) {
  return (
    <div>
      <Formik
        initialValues={{
          body: data!.body,
          issuer: data!.issuer,
          payer: data!.payer,
        }}
        onSubmit={(values, formik) => console.log(removeTypename(values))}
        validationSchema={invoiceInputSchema}
      >
        {({ handleSubmit }: FormikProps<Values>) => (
          <Form onSubmit={handleSubmit}>
            <Button type="submit">submit</Button>
          </Form>
        )}
      </Formik>
      {downloadLink}
    </div>
  );
}
