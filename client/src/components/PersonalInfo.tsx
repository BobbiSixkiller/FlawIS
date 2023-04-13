import { Formik, FormikBag, FormikProps } from "formik";
import { FC, useEffect, useRef, useState } from "react";
import { Button, Form, Input, Segment } from "semantic-ui-react";

import { InferType, object, string } from "yup";
import {
	User,
	useUpdateConferenceUserMutation,
	useUpdateUserMutation,
} from "../graphql/generated/schema";
import parseErrors from "../util/parseErrors";
import { InputField } from "./form/InputField";

const perosnalInfoInputSchema = object({
	name: string().required(),
	email: string().required().email(),
	organisation: string().required(),
	telephone: string().required(),
});

type Values = InferType<typeof perosnalInfoInputSchema>;

const PersonalInfo: FC<{
	user?: Pick<User, "id" | "name" | "email" | "organisation" | "telephone">;
}> = ({ user }) => {
	const [update, setUpdate] = useState(false);

	const [updateUser] = useUpdateUserMutation({
		onCompleted: () => {
			setUpdate(false);
		},
	});

	const [updateConferenceUser] = useUpdateConferenceUserMutation();

	return (
		<Formik
			initialValues={{
				name: user?.name || "",
				email: user?.email || "",
				organisation: user?.organisation || "",
				telephone: user?.telephone || "",
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
								primary
								type="button"
								content="Click to update"
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
