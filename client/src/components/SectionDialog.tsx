import { Formik, FormikProps } from "formik";
import { useTranslation } from "next-i18next";
import { useContext, useRef } from "react";
import { Button, Form, Input, Select, TextArea } from "semantic-ui-react";
import { InferType, object, string, array } from "yup";
import {
  useCreateSectionMutation,
  useUpdateSectionMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import { InputField, LocalizedInputField } from "./form/InputField";

const sectionInputSchema = object({
  name: string().required(),
  description: string().required(),
  languages: array()
    .of(string().required())
    .required()
    .min(1, "Zadajte aspon jeden jazyk!"),
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

type Values = InferType<typeof sectionInputSchema>;

export default function SectionDialog({
  id,
  data,
}: {
  id: string;
  data?: Values;
}) {
  const { handleOpen, handleClose, setError } = useContext(DialogContext);
  const formikRef = useRef<FormikProps<Values>>(null);

  const { i18n } = useTranslation();

  const [create] = useCreateSectionMutation({
    update(cache, { data }) {
      cache.modify({
        id: cache.identify({ __ref: `Conference:${id}` }),
        fields: {
          sections(existing) {
            const array = [...existing];
            array.push(data?.createSection);
            return array;
          },
        },
      });
    },
  });
  const [update] = useUpdateSectionMutation({
    update(cache, { data }) {
      cache.modify({
        id: cache.identify({ __ref: `Conference:${id}` }),
        fields: {
          sections(existing) {
            const array = [...existing];

            const index = array.findIndex(
              (s) => s.id === data?.updateSection.id
            );
            if (index > -1) {
              array[index] = data?.updateSection;
            }
            return array;
          },
        },
      });
    },
  });

  return (
    <Button
      positive
      floated="right"
      icon={data ? "edit" : "plus"}
      size="tiny"
      onClick={() =>
        handleOpen({
          size: "tiny",
          header: data ? "Upraviť sekciu" : "Pridať sekciu",
          confirmText: data ? "Aktualizovať" : "Pridať",
          cancelText: "Zrušiť",
          confirmCb: () => formikRef.current?.submitForm(),
          content: (
            <Formik
              innerRef={formikRef}
              initialValues={{
                name: data?.name || "",
                description: data?.description || "",
                languages: data?.languages || [],
                translations: [
                  {
                    language: i18n.language === "sk" ? "en" : "sk",
                    name: data?.translations[0].name || "",
                    description: data?.translations[0].description || "",
                  },
                ],
              }}
              validationSchema={sectionInputSchema}
              onSubmit={async (values, formik) => {
                try {
                  if (data) {
                    await update({ variables: { id, data: values } });
                  } else {
                    await create({ variables: { id, data: values } });
                  }
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
                    placeholder="Názov sekcie..."
                    label="Názov"
                    name="name"
                    control={Input}
                  />
                  <LocalizedInputField
                    placeholder="Popis sekcie..."
                    label="Popis"
                    name="description"
                    control={TextArea}
                  />
                  <InputField
                    placeholder="Rokovacie jazyky sekcie..."
                    label="Jazyk"
                    name="languages"
                    multiple
                    options={[
                      { key: 0, value: "SK", text: "SK" },
                      { key: 0, value: "CZ", text: "CZ" },
                      { key: 0, value: "EN", text: "EN" },
                    ]}
                    control={Select}
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
