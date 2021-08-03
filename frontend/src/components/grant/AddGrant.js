import React, { useState } from "react";
import { ModalHeader, ModalBody } from "reactstrap";

import { WizzardForm, FormStep } from "../form/WizzardForm";
import { grantIdSchema, grantBudgetSchema } from "../../util/validation";

import GrantID from "./GrantWizzard/GrandID";
import GrantBudget from "./GrantWizzard/GrantBudget";

import { useDataSend } from "../../hooks/useApi";
import { normalizeErrors } from "../../util/helperFunctions";

export default function AddGrant({ toggle }) {
	const [years, setYears] = useState([new Date().getFullYear()]);

	const { error, data, sendData, hideMessage } = useDataSend();

	return (
		<>
			<ModalHeader toggle={toggle}>Nový grant</ModalHeader>
			<ModalBody>
				<WizzardForm
					backendError={error}
					backendData={data}
					hideMessage={hideMessage}
					toggle={toggle}
					initialValues={{
						name: "",
						type: "APVV",
						idNumber: "",
						start: "",
						end: "",
						budget: [],
					}}
					onSubmit={async (values, helpers) => {
						await sendData("grant/", "POST", values);
						if (error && data) {
							console.log(data.errors);
							helpers.setStatus(normalizeErrors(data.errors));
						} else {
							helpers.setStatus({});
						}
						helpers.setSubmitting(false);
					}}
				>
					<FormStep
						// onSubmit={(values) => {
						// 	console.log("GRANT ID SUBMIT", values);
						// }}
						validationSchema={grantIdSchema}
					>
						<GrantID setYears={setYears} />
					</FormStep>
					{years.map((y, i) => (
						<FormStep
							// onSubmit={(values) => {
							//   console.log("GRANT BUDGET SUBMIT", values);
							// }}
							validationSchema={grantBudgetSchema}
							key={i}
						>
							<GrantBudget index={i} />
						</FormStep>
					))}
				</WizzardForm>
			</ModalBody>
		</>
	);
}
