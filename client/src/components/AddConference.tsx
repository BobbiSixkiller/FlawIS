import { useTranslation } from "next-i18next";
import { useContext } from "react";
import { Button, Input, TextArea } from "semantic-ui-react";
import { array, date, mixed, object, ref, string } from "yup";
import { FileType } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import Validation, {
  checkIfFilesAreCorrectType,
  checkIfFilesAreTooBig,
} from "../util/validation";
import FileUpload from "./form/FileUpload";

import { InputField, LocalizedInputField } from "./form/InputField";
import MultipleFileUploadField from "./form/Upload/MultipleFileUploadField";
import { Wizzard, WizzardStep } from "./form/Wizzard";

export default function AddConference() {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);

  const { conferenceInputSchema, conferenceInvoiceInputSchema } = Validation();

  const { i18n } = useTranslation();

  return (
    <Button
      content="Nova konfera"
      size="huge"
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
                translations: [{ language: i18n.language }],
              }}
              onSubmit={async (values, formik) => {
                console.log(values);
              }}
            >
              <WizzardStep
                icon="clipboard"
                title="Konferencia"
                description="Základné informácie o plánovanej konferencii"
                validationSchema={conferenceInputSchema}
              >
                <LocalizedInputField
                  placeholder="name..."
                  label="name"
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
                  placeholder="description..."
                  label="Description"
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
                  accept={{ "image/*": [] }}
                  maxFiles={3}
                  maxSize={100 * 1024}
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
