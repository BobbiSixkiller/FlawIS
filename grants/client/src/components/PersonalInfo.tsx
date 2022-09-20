import { useMutation } from "@apollo/client";
import { Formik, FormikProps } from "formik";
import { FC, useContext, useState } from "react";
import { Button, Form, Grid, Input, Segment } from "semantic-ui-react";
import { UPDATE_USER } from "src/graphql/User.graphql";
import {
  updateUser,
  updateUserVariables,
} from "src/graphql/__generated__/updateUser";
import { ActionTypes, AuthContext } from "src/providers/Auth";
import { InferType, object, string } from "yup";
import InputField from "./form/InputField";
import parseErrors from "../util/parseErrors";

const perosnalInfoInputSchema = object({
  name: string().required(),
  email: string().required().email(),
  organisation: string().required(),
  telephone: string().required(),
});

type Values = InferType<typeof perosnalInfoInputSchema>;

const PersonalInfo: FC = () => {
  const [update, setUpdate] = useState(false);
  const { user, dispatch } = useContext(AuthContext);

  const [updateUser] = useMutation<updateUser, updateUserVariables>(
    UPDATE_USER,
    {
      onCompleted: ({ updateUser }) => {
        dispatch({ type: ActionTypes.Login, payload: { user: updateUser } });
        setUpdate(false);
      },
    }
  );

  return (
    <Grid>
      <Grid.Column mobile={16} tablet={12} computer={8}>
        <Formik
          initialValues={{
            name: user.name,
            email: user.email,
            organisation: user.organisation,
            telephone: user.telephone,
          }}
          validationSchema={perosnalInfoInputSchema}
          onSubmit={async (values, actions) => {
            try {
              await updateUser({
                variables: {
                  id: user.id,
                  data: {
                    email: values.email,
                    name: values.name,
                    organisation: values.organisation,
                    telephone: values.telephone,
                  },
                },
              });
            } catch (err) {
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
                <InputField
                  fluid
                  disabled={!update}
                  icon="user"
                  iconPosition="left"
                  placeholder="Name including titles"
                  label="Name including titles"
                  name="name"
                  control={Input}
                />

                <InputField
                  fluid
                  disabled={!update}
                  icon="at"
                  iconPosition="left"
                  placeholder="E-mail address"
                  label="Email"
                  name="email"
                  control={Input}
                />

                <InputField
                  fluid
                  disabled={!update}
                  icon="phone"
                  iconPosition="left"
                  placeholder="Telephone number"
                  label="Telephone"
                  name="telephone"
                  control={Input}
                />

                <InputField
                  fluid
                  disabled={!update}
                  icon="building"
                  iconPosition="left"
                  placeholder="Name of the organisation"
                  label="Organisation"
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
                      Cancel
                    </Button>
                    <Button.Or />
                    <Button
                      type="submit"
                      positive
                      disabled={isSubmitting}
                      loading={isSubmitting}
                    >
                      Save
                    </Button>
                  </Button.Group>
                ) : (
                  <Button
                    type="button"
                    content="Click to update"
                    onClick={() => setUpdate(true)}
                  />
                )}
              </Segment>
            </Form>
          )}
        </Formik>
      </Grid.Column>
    </Grid>
  );
};

export default PersonalInfo;
