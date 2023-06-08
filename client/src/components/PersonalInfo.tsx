import { Formik, FormikProps } from "formik";
import { useTranslation } from "next-i18next";
import { FC, useState } from "react";
import { Button, Form, Input, Segment } from "semantic-ui-react";

import { InferType, object, string, TypeOf } from "yup";
import {
  User,
  useUpdateConferenceUserMutation,
  useUpdateUserMutation,
} from "../graphql/generated/schema";
import parseErrors from "../util/parseErrors";
import Validation from "../util/validation";
import { InputField } from "./form/InputField";

const PersonalInfo: FC<{
  user?: Pick<
    User,
    | "id"
    | "name"
    | "email"
    | "organisation"
    | "telephone"
    | "titlesAfter"
    | "titlesBefore"
  >;
}> = ({ user }) => {
  const [update, setUpdate] = useState(false);

  const [updateUser] = useUpdateUserMutation({
    onCompleted: () => {
      setUpdate(false);
    },
  });

  const [updateConferenceUser] = useUpdateConferenceUserMutation();

  const { perosnalInfoInputSchema } = Validation();
  type Values = InferType<typeof perosnalInfoInputSchema>;

  const { t } = useTranslation("profile");

  return (
    <Formik
      initialValues={{
        name: user?.name || "",
        email: user?.email || "",
        organisation: user?.organisation || "",
        telephone: user?.telephone || "",
        titlesBefore: user?.titlesBefore || "",
        titlesAfter: user?.titlesAfter,
      }}
      validationSchema={perosnalInfoInputSchema}
      onSubmit={async (values, actions) => {
        try {
          await updateUser({
            variables: {
              id: user?.id,
              data: {
                email: values.email,
                name: values.name,
              },
            },
          });
          await updateConferenceUser({
            variables: {
              data: {
                titlesBefore: values.titlesBefore,
                titlesAfter: values.titlesAfter,
                organisation: values.organisation,
                telephone: values.telephone,
              },
            },
          });
        } catch (err: any) {
          actions.setStatus(
            parseErrors(
              err.graphQLErrors[0].extensions.exception.validationErrors
            )
          );
        }
      }}
    >
      {({ handleSubmit, isSubmitting, resetForm }: FormikProps<Values>) => (
        <Form onSubmit={handleSubmit}>
          <Segment>
            <Form.Group>
              <InputField
                placeholder="JUDr."
                label={t("titles.label", { ns: "register" })}
                name="titlesBefore"
                control={Input}
                width={3}
                disabled={!update}
              />
              <InputField
                width={10}
                placeholder={t("name.placeholder", { ns: "register" })}
                label={t("name.label", { ns: "register" })}
                name="name"
                control={Input}
                disabled={!update}
              />
              <InputField
                placeholder="PhD."
                label={t("titles.label", { ns: "register" })}
                name="titlesAfter"
                control={Input}
                disabled={!update}
                width={3}
              />
            </Form.Group>

            <InputField
              fluid
              disabled={!update}
              icon="at"
              iconPosition="left"
              placeholder={t("email.placeholder", { ns: "register" })}
              label={t("email.label", { ns: "register" })}
              name="email"
              control={Input}
            />

            <InputField
              fluid
              disabled={!update}
              icon="phone"
              iconPosition="left"
              placeholder={t("phone.placeholder", { ns: "register" })}
              label={t("phone.label", { ns: "register" })}
              name="telephone"
              control={Input}
            />

            <InputField
              fluid
              disabled={!update}
              icon="building"
              iconPosition="left"
              placeholder={t("organisation.placeholder", { ns: "register" })}
              label={t("organisation.label", { ns: "register" })}
              name="organisation"
              control={Input}
            />

            {update ? (
              <Button.Group>
                <Button
                  type="reset"
                  onClick={() => {
                    resetForm();
                    setUpdate(false);
                  }}
                >
                  {t("actions.cancel", { ns: "common" })}
                </Button>
                <Button.Or text="/" />
                <Button
                  type="submit"
                  positive
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {t("actions.save", { ns: "common" })}
                </Button>
              </Button.Group>
            ) : (
              <Button
                primary
                type="button"
                content={t("actions.updateToggle", { ns: "common" })}
                onClick={() => setUpdate(true)}
              />
            )}
          </Segment>
        </Form>
      )}
    </Formik>
  );
};

export default PersonalInfo;
