import React from "react";
import { Formik, Form } from "formik";

import {
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Row,
	Col,
	Spinner,
	Alert,
} from "reactstrap";

import NumberInput from "../form/NumberInput";

import { budgetSchema } from "../../util/validation";
import { useDataSend } from "../../hooks/useApi";

export default function EditBudget({ toggle, modalData }) {
	const { error, data, sendData, hideMessage } = useDataSend();

	return (
		<Formik
			initialValues={{
				year: new Date(modalData.budget.year).getFullYear(),
				travel: modalData.budget.travel,
				material: modalData.budget.material,
				services: modalData.budget.services,
				indirect: modalData.budget.indirect,
				salaries: modalData.budget.salaries,
			}}
			validationSchema={budgetSchema}
			onSubmit={async (values, helpers) => {
				await sendData(
					`grant/${modalData.grantId}/budget/${modalData.budget._id}`,
					"PUT",
					values
				);
			}}
		>
			{({ values, isSubmitting }) => (
				<Form>
					<ModalHeader toggle={toggle}>
						Upraviť rozpočet {values.year}
					</ModalHeader>
					<ModalBody>
						<Row form className="justify-content-center">
							<Col>
								<NumberInput
									name="travel"
									placeholder="Cestovné..."
									label="Cestovné"
								/>
							</Col>
						</Row>
						<Row form className="justify-content-center">
							<Col>
								<NumberInput
									name="services"
									placeholder="Položka pre služby..."
									label="Služby"
								/>
							</Col>
						</Row>
						<Row form className="justify-content-center">
							<Col>
								<NumberInput
									name="material"
									placeholder="Položka pre materiál..."
									label="Materiál"
								/>
							</Col>
						</Row>
						<Row form className="justify-content-center">
							<Col>
								<NumberInput
									name="indirect"
									placeholder="Položka pre nepriame náklady..."
									label="Nepriame"
								/>
							</Col>
						</Row>
						<Row form className="justify-content-center">
							<Col>
								<NumberInput
									name="salaries"
									placeholder="Položka pre mzdy..."
									label="Mzdy"
								/>
							</Col>
						</Row>
						{data && (
							<Row className="justify-content-center my-3">
								<Col>
									<Alert
										color={error ? "danger" : "success"}
										isOpen={data}
										toggle={hideMessage}
									>
										{data.message}
									</Alert>
								</Col>
							</Row>
						)}
					</ModalBody>
					<ModalFooter>
						<Button type="submit" color="warning" disabled={isSubmitting}>
							{isSubmitting ? <Spinner size="sm" color="light" /> : "Upraviť"}
						</Button>{" "}
						<Button outline color="secondary" onClick={toggle}>
							Zrušiť
						</Button>
					</ModalFooter>
				</Form>
			)}
		</Formik>
	);
}
