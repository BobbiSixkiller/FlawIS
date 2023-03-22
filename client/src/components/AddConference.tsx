import { useTranslation } from "next-i18next";
import { useContext } from "react";
import { Button, Input, TextArea } from "semantic-ui-react";
import {
  ConferenceInput,
  FileType,
  useCreateConferenceMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import Validation from "../util/validation";

import { InputField, LocalizedInputField } from "./form/InputField";
import MultipleFileUploadField from "./form/Upload/MultipleFileUploadField";
import { Wizzard, WizzardStep } from "./form/Wizzard";

export default function AddConference() {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);

  const { conferenceInputSchema, conferenceInvoiceInputSchema } = Validation();

  const [newConference] = useCreateConferenceMutation();

  const { i18n } = useTranslation();

  return (
    <Button
      style={{ margin: 0 }}
      size="huge"
      icon="plus"
      circular
      positive
      onClick={() =>
        handleOpen({
          size: "small",
          header: "Nová konferencia",
          content: (
            <Wizzard
              goBackCb={() => handleClose()}
              initialValues={{
                name: "",
                slug: "",
                description: "",
                dates: { start: undefined, end: undefined },
                files: [],
                billing: {
                  name: "",
                  address: {
                    street: "",
                    city: "",
                    postal: "",
                    country: "",
                  },
                  variableSymbol: "",
                  ICO: "",
                  DIC: "",
                  ICDPH: "",
                  IBAN: "",
                  SWIFT: "",
                },
                translations: [
                  { language: i18n.language === "sk" ? "en" : "sk" },
                ],
              }}
              onSubmit={async (values, formik) => {
                console.log(values);
                try {
                  await newConference({
                    variables: {
                      data: {
                        name: values.name,
                        description: values.description,
                        slug: values.slug,
                        dates: {
                          start: values.dates.start,
                          end: values.dates.end,
                        },
                        logoUrl: values.files[0].url,
                        billing: {
                          ...values.billing,
                          stampUrl: values.files[2].url,
                        },
                        translations: [
                          {
                            ...values.translations[0],
                            logoUrl: values.files[1].url,
                          },
                        ],
                      } as ConferenceInput,
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
              <WizzardStep
                icon="clipboard"
                title="Konferencia"
                description="Základné informácie o plánovanej konferencii"
                validationSchema={conferenceInputSchema}
              >
                <LocalizedInputField
                  placeholder="Názov..."
                  label="Názov"
                  name="name"
                  control={Input}
                  type="text"
                />

                <InputField
                  placeholder="slug..."
                  label="Slug"
                  name="slug"
                  control={Input}
                  type="text"
                />

                <LocalizedInputField
                  placeholder="Popis..."
                  label="Popis"
                  name="description"
                  control={TextArea}
                  type="text"
                />

                <InputField
                  fluid
                  placeholder="Začiatok konferencie..."
                  label="Začiatok konferencie"
                  name="dates.start"
                  control={Input}
                  type="datetime-local"
                />

                <InputField
                  fluid
                  placeholder="Koniec konferencie..."
                  label="Koniec konferencie"
                  name="dates.end"
                  control={Input}
                  type="datetime-local"
                />

                <MultipleFileUploadField
                  name="files"
                  label="Nahrajte v nasledovnom poradí: Logo SK, Logo EN, Pečiatku"
                  filetype={FileType.Image}
                  accept={{ "image/*": [] }}
                  maxFiles={3}
                  maxSize={200 * 1024}
                />
              </WizzardStep>
              <WizzardStep
                icon="money"
                title="Fakturácia"
                description="Fakturačné údaje organizátora"
                validationSchema={conferenceInputSchema.concat(
                  conferenceInvoiceInputSchema
                )}
              >
                <InputField
                  placeholder="Názov..."
                  label="Názov"
                  name="billing.name"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="Ulica..."
                  label="Ulica"
                  name="billing.address.street"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="Mesto..."
                  label="Mesto"
                  name="billing.address.city"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="PSČ..."
                  label="PSČ"
                  name="billing.address.postal"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="Krajina..."
                  label="Krajina"
                  name="billing.address.country"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="IČO..."
                  label="IČO"
                  name="billing.ICO"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="DIČ..."
                  label="DIČ"
                  name="billing.DIC"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="IČDPH..."
                  label="IČDPH"
                  name="billing.ICDPH"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="Variabilný symbol..."
                  label="Variabilný symbol"
                  name="billing.variableSymbol"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="IBAN..."
                  label="IBAN"
                  name="billing.IBAN"
                  control={Input}
                  type="text"
                />
                <InputField
                  placeholder="SWIFT..."
                  label="SWIFT"
                  name="billing.SWIFT"
                  control={Input}
                  type="text"
                />
              </WizzardStep>
            </Wizzard>
          ),
        })
      }
    />
  );
}
