import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "../../_app";
import { Button, Form, Grid, Header, Input, Segment } from "semantic-ui-react";
import { InferType, object, string } from "yup";
import { useState, useContext } from "react";
import { Formik, FormikProps } from "formik";

import Dashboard from "../../../components/Dashboard";
import { useUpdateUserMutation } from "../../../graphql/generated/schema";
import { ActionTypes, AuthContext } from "../../../providers/Auth";
import parseErrors from "../../../util/parseErrors";
import { InputField } from "../../../components/form/InputField";
import { useTranslation } from "next-i18next";
import Validation from "../../../util/validation";

const ProfilePage: NextPageWithLayout = () => {
	const [update, setUpdate] = useState(false);
	const { user, dispatch } = useContext(AuthContext);
	const { t } = useTranslation(["common", "profile"]);

	const { perosnalInfoInputSchema } = Validation();

	type Values = InferType<typeof perosnalInfoInputSchema>;

	const [updateUser] = useUpdateUserMutation({
		onCompleted: ({ updateUser }) => {
			dispatch({ type: ActionTypes.Login, payload: { user: updateUser } });
			setUpdate(false);
		},
	});

	return (
		<Grid padded>
			<Grid.Row verticalAlign="middle">
				<Grid.Column>
					<Header>{t("header", { ns: "profile" })}</Header>
				</Grid.Column>
			</Grid.Row>
			<Grid.Row>
				<Grid.Column>
					<Formik
						initialValues={{
							name: user?.name || "",
							email: user?.email || "",
							organisation: user?.organisation || "",
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
							} catch (err: any) {
								actions.setStatus(
									parseErrors(
										err.graphQLErrors[0].extensions.exception.validationErrors
									)
								);
							}
						}}
					>
						{({
							handleSubmit,
							isSubmitting,
							resetForm,
						}: FormikProps<Values>) => (
							<Form onSubmit={handleSubmit}>
								<Segment>
									<InputField
										fluid
										disabled={!update}
										icon="user"
										iconPosition="left"
										placeholder={t("form.name.placeholder", { ns: "profile" })}
										label={t("form.name.label", { ns: "profile" })}
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
										icon="building"
										iconPosition="left"
										placeholder={t("form.organisation.placeholder", {
											ns: "profile",
										})}
										label={t("form.organisation.label", { ns: "profile" })}
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
											<Button.Or text={"/"} />
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
											type="button"
											content={t("actions.updateToggle", { ns: "common" })}
											onClick={() => setUpdate(true)}
										/>
									)}
								</Segment>
							</Form>
						)}
					</Formik>
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);
};

ProfilePage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		protect: true,
		...(await serverSideTranslations(locale, ["profile", "common"])),
	},
});

export default ProfilePage;
