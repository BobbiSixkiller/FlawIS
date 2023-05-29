import { Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Button, Form, Input, Segment, TextArea } from "semantic-ui-react";
import { InferType, number, object, string } from "yup";
import {
  Invoice,
  InvoiceInput,
  useUpdateInvoiceMutation,
} from "../graphql/generated/schema";
import removeTypename from "../util/removeTypename";
import { InputField } from "./form/InputField";

const invoiceInputSchema = object({
  issuer: object({
    name: string().trim().required(),
    address: object({
      street: string().trim().required(),
      city: string().trim().required(),
      postal: string().trim().required(),
      country: string().trim().required(),
    }).required(),
    variableSymbol: string().trim().required(),
    IBAN: string().trim().required(),
    SWIFT: string().trim().required(),
    ICO: string().trim().required(),
    DIC: string().trim().required(),
    ICDPH: string().trim().required(),
    stampUrl: string().required(),
  }).required(),
  payer: object({
    name: string().trim().required(),
    address: object({
      street: string().trim().required(),
      city: string().trim().required(),
      postal: string().trim().required(),
      country: string().trim().required(),
    }).required(),
    ICO: string().trim(),
    DIC: string().trim(),
    ICDPH: string().trim(),
  }).required(),
  body: object({
    body: string().trim().required(),
    comment: string().trim().required(),
    dueDate: string().trim().required(),
    issueDate: string().trim().required(),
    price: number().required(),
    type: string().trim().required(),
    vat: number().required(),
    vatDate: string().trim().required(),
  }).required(),
}).required();

type Values = InferType<typeof invoiceInputSchema>;

export default function UpdateInvoiceForm({
  data,
  downloadLink,
}: {
  data?: Invoice;
  downloadLink: ReactElement;
}) {
  const router = useRouter();
  const [update] = useUpdateInvoiceMutation();

  return (
    <Formik
      initialValues={{
        body: data!.body,
        issuer: data!.issuer,
        payer: data!.payer,
      }}
      onSubmit={async (values, formik) => {
        try {
          await update({
            variables: {
              id: router.query.attendee,
              data: removeTypename(values) as InvoiceInput,
            },
          });
        } catch (error) {
          console.log(error);
        }
      }}
      validationSchema={invoiceInputSchema}
    >
      {({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
        <Segment>
          <Form onSubmit={handleSubmit}>
            <InputField label="Meno platcu" name="payer.name" control={Input} />
            <InputField
              label="Ulica"
              name="payer.address.street"
              control={Input}
            />
            <InputField
              label="Mesto"
              name="payer.address.city"
              control={Input}
            />
            <InputField
              label="PSČ"
              name="payer.address.postal"
              control={Input}
            />
            <InputField
              label="Krajina"
              name="payer.address.country"
              control={Input}
            />
            <InputField label="IČO" name="payer.ICO" control={Input} />{" "}
            <InputField label="DIČ" name="payer.DIC" control={Input} />
            <InputField label="IČDPH" name="payer.ICDPH" control={Input} />
            <InputField
              label="Dátum vystavenia"
              name="body.issueDate"
              control={Input}
              type="date"
            />
            <InputField
              label="Dátum zdaniteľného plnenia"
              name="body.vatDate"
              control={Input}
              type="date"
            />
            <InputField
              label="Uhradiť do"
              name="body.dueDate"
              control={Input}
              type="date"
            />
            <InputField label="Telo" name="body.body" control={TextArea} />
            <InputField
              label="Komentár"
              name="body.comment"
              control={TextArea}
            />
            <InputField
              label="Cena bez DPH v eurách"
              name="body.price"
              control={Input}
              type="number"
            />
            <InputField
              label="DPH v eurách"
              name="body.vat"
              control={Input}
              type="number"
            />
            <Button
              type="submit"
              positive
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Aktualizovať
            </Button>
            {downloadLink}
          </Form>
        </Segment>
      )}
    </Formik>
  );
}
