import { Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import { useContext } from "react";
import { Button, Form, Input } from "semantic-ui-react";
import { date, InferType, object, number } from "yup";
import { useAddApprovedBudgetMutation } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import { InputField } from "./form/InputField";

const budgetInputSchema = object({
	year: date().required(),
	travel: number().required(),
	material: number().required(),
	services: number().required(),
	salaries: number().required(),
	indirect: number().required(),
});

type Values = InferType<typeof budgetInputSchema>;

function AddBudget() {
	const { handleClose } = useContext(DialogContext);
	const { query } = useRouter();

	const [addBudget] = useAddApprovedBudgetMutation({
		onCompleted: () => handleClose(),
	});

	return (
		<Formik
			initialValues={{
				year: new Date("yyyy-MM-dd"),
				travel: 0,
				material: 0,
				services: 0,
				salaries: 0,
				indirect: 0,
			}}
			validationSchema={budgetInputSchema}
			onSubmit={async (values, formik) => {
				console.log(values);
				try {
					await addBudget({ variables: { id: query.id, data: values } });
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

export default function AddBudgetDialog() {
	const { handleOpen } = useContext(DialogContext);

	return (
		<Button
			positive
			floated="right"
			icon="plus"
			size="tiny"
			onClick={() =>
				handleOpen({
					content: <AddBudget />,
					size: "tiny",
					header: "Pridať rozpočet",
				})
			}
		/>
	);
}
