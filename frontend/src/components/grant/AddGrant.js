import React, { useState } from "react";
import { ModalHeader, ModalBody } from "reactstrap";

import { WizzardForm, FormStep } from "../form/WizzardForm";
import { grantIdSchema, grantBudgetSchema } from "../../util/validation";

import GrantID from "./GrantWizzard/GrandID";
import GrantBudget from "./GrantWizzard/GrantBudget";

import { useDataSend } from "../../hooks/useApi";

export default function AddGrant({ toggle }) {
	const [years, setYears] = useState([new Date().getFullYear()]);

	const { sendData } = useDataSend();

	return (
		<>
			<ModalHeader toggle={toggle}>Nový grant</ModalHeader>
			<ModalBody>
				<WizzardForm
					toggle={toggle}
					initialValues={{
						name: "",
						type: "APVV",
						idNumber: "",
						start: "",
						end: "",
						budget: [],
					}}
					initialStatus={{ success: false, message: "", errors: [] }}
					onSubmit={async (values, { resetForm }) => {
						const res = await sendData("grant/", "POST", values);
						resetForm({
							values,
							status: {
								success: res.success,
								message: res.message,
								errors: res.errors || [],
							},
						});
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
