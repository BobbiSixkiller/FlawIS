import React from "react";

import {
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	FormFeedback,
	Label,
	Input,
	Alert,
} from "reactstrap";

import { budgetSchema } from "../../util/validation";
import useFormValidation from "../../hooks/useFormValidation";
import { useDataSend } from "../../hooks/useApi";

export default function EditBudget({ toggle, modalData }) {
	const INITIAL_STATE = {
		travel: modalData.budget.travel,
		material: modalData.budget.material,
		services: modalData.budget.services,
		indirect: modalData.budget.indirect,
		salaries: modalData.budget.salaries,
	};

	const { loading, error, data, sendData, hideMessage } = useDataSend();

	const { handleSubmit, handleChange, handleBlur, values, errors, valid } =
		useFormValidation(INITIAL_STATE, function name(params) {}, editBudget);

	function editBudget() {
		sendData(
			`grant/${modalData.grantId}/budget/${modalData.budget._id}`,
			"PUT",
			values
		);
	}

	return (
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={toggle}>
				Upraviť rozpočet {new Date(modalData.budget.year).getFullYear()}
			</ModalHeader>
			<ModalBody>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="travel">Cestovné:</Label>
							<Input
								id="travel"
								name="travel"
								placeholder="Položka pre cestovné"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.travel}
								invalid={errors.travel && true}
								valid={valid.travel && true}
								autoComplete="off"
							/>
							<FormFeedback invalid="true">{errors.travel}</FormFeedback>
							<FormFeedback valid>{valid.travel}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="services">Služby:</Label>
							<Input
								id="services"
								name="services"
								placeholder="Položka pre služby"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.services}
								invalid={errors.services && true}
								valid={valid.services && true}
								autoComplete="off"
							/>
							<FormFeedback invalid="true">{errors.services}</FormFeedback>
							<FormFeedback valid>{valid.services}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="material">Materiál:</Label>
							<Input
								id="material"
								name="material"
								placeholder="Položka pre materiál"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.material}
								invalid={errors.material && true}
								valid={valid.material && true}
								autoComplete="off"
							/>
							<FormFeedback invalid="true">{errors.material}</FormFeedback>
							<FormFeedback valid>{valid.material}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="indirect">Nepriame:</Label>
							<Input
								id="indirect"
								name="indirect"
								placeholder="Položka pre nepriame náklady"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.indirect}
								invalid={errors.indirect && true}
								valid={valid.indirect && true}
								autoComplete="off"
							/>
							<FormFeedback invalid="true">{errors.indirect}</FormFeedback>
							<FormFeedback valid>{valid.indirect}</FormFeedback>
						</FormGroup>
					</Col>
				</Row>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="salaries">Mzdy:</Label>
							<Input
								id="salaries"
								name="salaries"
								placeholder="Položka pre nepriame náklady"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.salaries}
								invalid={errors.salaries && true}
								valid={valid.salaries && true}
								autoComplete="off"
							/>
							<FormFeedback invalid="true">{errors.salaries}</FormFeedback>
							<FormFeedback valid>{valid.salaries}</FormFeedback>
						</FormGroup>
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
								{data.errors && (
									<>
										<hr />
										<ul>
											{data.errors.map((e) => (
												<li>{e}</li>
											))}
										</ul>
									</>
								)}
							</Alert>
						</Col>
					</Row>
				)}
			</ModalBody>
			<ModalFooter>
				<Button type="submit" color="warning" disabled={loading}>
					Upraviť
				</Button>{" "}
				<Button outline color="secondary" onClick={toggle}>
					Zrušiť
				</Button>
			</ModalFooter>
		</Form>
	);
}
