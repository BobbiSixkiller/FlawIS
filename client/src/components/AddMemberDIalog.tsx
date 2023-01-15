import { Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import { SyntheticEvent, useContext } from "react";
import {
	Button,
	Dropdown,
	DropdownOnSearchChangeData,
	Form,
	Input,
} from "semantic-ui-react";
import { InferType, object, number, boolean, string } from "yup";
import { useAddMemberMutation } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import AutocompleteInputField from "./form/AutocompleteInputField";
import CheckboxField from "./form/CheckboxField";
import { InputField } from "./form/InputField";

const budgetInputSchema = object({
	member: string().required(),
	isMain: boolean().required(),
	hours: number().required(),
});

type Values = InferType<typeof budgetInputSchema>;

export default function AddMemberDialog({ year }: { year: any }) {
	const { handleOpen, handleClose } = useContext(DialogContext);
	const { query } = useRouter();
	console.log(year);

	const [addMember] = useAddMemberMutation({
		onCompleted: () => handleClose(),
	});

	return (
		<Button
			positive
			floated="right"
			icon="plus"
			size="tiny"
			onClick={() =>
				handleOpen({
					size: "tiny",
					header: "Pridať rozpočet",
					content: (
						<Formik
							initialValues={{ member: "", isMain: false, hours: 0 }}
							validationSchema={budgetInputSchema}
							onSubmit={async (values, formik) => {
								console.log(values);
								try {
									await addMember({
										variables: {
											id: query.id,
											year: year,
											data: values,
										},
									});
								} catch (error: any) {
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
									<AutocompleteInputField
										placeholder="Riešiteľ..."
										label="Riešiteľ"
										name="member"
									/>
									<InputField
										placeholder="Hodiny..."
										label="Hodiny"
										name="hours"
										control={Input}
										type="number"
									/>
									<CheckboxField
										name="isMain"
										label={<label>Hlavný riešiteľ</label>}
									/>

									<Button secondary onClick={() => handleClose()} type="button">
										Zrušiť
									</Button>
									<Button positive type="submit">
										Pridať
									</Button>
								</Form>
							)}
						</Formik>
					),
				})
			}
		/>
	);
}
