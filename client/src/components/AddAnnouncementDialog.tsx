import { Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import { useContext } from "react";
import { Button, Form, Input } from "semantic-ui-react";
import { InferType, object, number, boolean, string } from "yup";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import { InputField } from "./form/InputField";

const budgetInputSchema = object({
	member: string().required(),
	isMain: boolean().required(),
	hours: number().required(),
});

type Values = InferType<typeof budgetInputSchema>;

function AddAnnouncement() {
	const { handleClose } = useContext(DialogContext);
	const { query } = useRouter();

	const [addAnnouncement] = useAddMemberMutation({
		onCompleted: () => handleClose(),
	});

	return (
		<Formik
			initialValues={{}}
			validationSchema={budgetInputSchema}
			onSubmit={async (values, formik) => {
				console.log(values);
				try {
					await addAnnouncement({ variables: { id: query.id, data: values } });
				} catch (error: any) {
					formik.setStatus(
						parseErrors(
							error.graphQLErrors[0].extensions.exception.validationErrors
						)
					);
				}
			}}
		>
			{({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
				<Form loading={isSubmitting} onSubmit={handleSubmit}>
					<InputField
						fluid
						placeholder="Rok..."
						label="Rok"
						name="year"
						control={Input}
						type="month"
					/>
					<InputField
						placeholder="Cestovné..."
						label="Cestovné"
						name="travel"
						control={Input}
						type="number"
					/>
					<InputField
						placeholder="Služby..."
						label="Služby"
						name="services"
						control={Input}
						type="number"
					/>
					<InputField
						placeholder="Materiál..."
						label="Materiál"
						name="material"
						control={Input}
						type="number"
					/>
					<InputField
						placeholder="Mzdy..."
						label="Mzdy"
						name="salaries"
						control={Input}
						type="number"
					/>
					<InputField
						placeholder="Nepriame..."
						label="Nepriame"
						name="indirect"
						control={Input}
						type="number"
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
	);
}

export default function AddMemberDialog() {
	const { handleOpen } = useContext(DialogContext);

	return (
		<Button
			positive
			floated="right"
			icon="plus"
			size="tiny"
			onClick={() =>
				handleOpen({
					content: <AddMember />,
					size: "tiny",
					header: "Pridať rozpočet",
				})
			}
		/>
	);
}
