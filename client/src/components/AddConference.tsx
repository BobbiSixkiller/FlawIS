import { useTranslation } from "next-i18next";
import { useContext } from "react";
import { Button, Input, TextArea } from "semantic-ui-react";
import { array, mixed, object, string } from "yup";
import { FileType } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import {
  checkIfFilesAreCorrectType,
  checkIfFilesAreTooBig,
} from "../util/validation";
import FileUpload from "./form/FileUpload";

import { LocalizedInputField } from "./form/InputField";
import { Wizzard, WizzardStep } from "./form/Wizzard";

export default function AddConference() {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);

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
                validationSchema={object({
                  name: string().trim().required(),
                  slug: string().trim().required(),
                  description: string().trim().required(),
                  files: array().of(
                    mixed()
                      .test(
                        "is-correct-file",
                        "VALIDATION_FIELD_FILE_BIG",
                        checkIfFilesAreTooBig
                      )
                      .test(
                        "is-big-file",
                        "VALIDATION_FIELD_FILE_WRONG_TYPE",
                        checkIfFilesAreCorrectType
                      )
                  ),
                })}
              >
                <LocalizedInputField
                  placeholder="name..."
                  label="name"
                  name="name"
                  control={Input}
                  type="text"
                />

                <LocalizedInputField
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

                <FileUpload
                  name="files"
                  label="Súbory v poradí: "
                  type={FileType.Image}
                />
              </WizzardStep>
              <WizzardStep
                icon="money"
                title="Účtovné"
                validationSchema={object({
                  name: string().trim().required(),
                  description: string().trim().required(),
                })}
              >
                <LocalizedInputField
                  placeholder="description..."
                  label="description"
                  name="description"
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
