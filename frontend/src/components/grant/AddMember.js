import React from "react";
import { Formik, Form, Field } from "formik";

import {
	Alert,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Row,
	Col,
	Spinner,
} from "reactstrap";

import RadioInput from "../form/RadioInput";
import NumberInput from "../form/NumberInput";
import { memberSchema } from "../../util/validation";
import { useDataSend } from "../../hooks/useApi";

import UserApiSearch from "../user/UserApiSearch";

export default function AddMember({ toggle, modalData }) {
	const { error, data, sendData, hideMessage } = useDataSend();

	return (
		<Formik
			initialValues={{ member: "", name: "", hours: 0, role: "basic" }}
			validationSchema={memberSchema}
			onSubmit={async (values, helpers) => {
				await sendData(
					`grant/${modalData.grantId}/budget/${modalData.budget._id}`,
					"POST",
					values
				);
			}}
		>
			{({ isSubmitting }) => (
				<Form>
					<ModalHeader toggle={toggle}>Pridať nového riešiteľa</ModalHeader>
					<ModalBody>
						<Row form className="justify-content-center">
							<Col sm={8}>
								<Field
									name="name"
									member="member"
									label="Riešiteľ"
									component={UserApiSearch}
								/>
							</Col>
							<Col sm={4}>
								<NumberInput name="hours" placeholder="Hodiny" label="Hodiny" />
							</Col>
						</Row>
						<Row form className="justify-content-center">
							<Col>
								<RadioInput
									inline
									type="radio"
									name="role"
									value="basic"
									label="Riesitel"
								/>
								<RadioInput
									inline
									type="radio"
									name="role"
									value="deputy"
									label="Zastupca"
								/>
								<RadioInput
									inline
									type="radio"
									name="role"
									value="leader"
									label="Veduci"
								/>
							</Col>
						</Row>
						{data && (
							<Row row className="justify-content-center my-3">
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
						<Button color="success" type="submit" disabled={isSubmitting}>
							{isSubmitting ? <Spinner size="sm" color="light" /> : "Pridať"}
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
