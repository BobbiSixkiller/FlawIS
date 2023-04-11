import { Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import { Button, Form } from "semantic-ui-react";
import { DialogContext } from "../providers/Dialog";
import Validation from "../util/validation";
import { InferType } from "yup";
import parseErrors from "../util/parseErrors";
import { useConferenceQuery } from "../graphql/generated/schema";
import { RegisterSubmission } from "../pages/conferences/[slug]/register";
import { useTranslation } from "next-i18next";

export default function AddSubmissionDialog() {
	const { handleOpen, handleClose, setError } = useContext(DialogContext);
	const { query } = useRouter();

	const { submissionInputSchema } = Validation();
	type Values = InferType<typeof submissionInputSchema>;

	const formikRef = useRef<FormikProps<Values>>(null);

	const { data } = useConferenceQuery({
		variables: { slug: query.slug as string },
	});

	const { i18n } = useTranslation();

	return (
		<Button
			positive
			floated="right"
			icon="plus"
			size="tiny"
			onClick={() =>
				handleOpen({
					size: "tiny",
					header: "Pridať prispevok",
					confirmText: "Pridať",
					cancelText: "Zrušiť",
					confirmCb: () => formikRef.current?.submitForm(),
					content: (
						<Formik
							innerRef={formikRef}
							initialValues={{
								submission: {
									abstract: "",
									authors: [],
									keywords: [],
									name: "",
									sectionId: "",
									translations: [
										{
											language: i18n.language === "sk" ? "en" : "sk",
											name: "",
											abstract: "",
											keywords: [],
										},
									],
								},
							}}
							validationSchema={submissionInputSchema}
							onSubmit={async (values, formik) => {
								try {
									console.log(values);
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
									<RegisterSubmission sections={data?.conference.sections} />
								</Form>
							)}
						</Formik>
					),
				})
			}
		/>
	);
}
