import React from "react";
import { ModalHeader, ModalBody } from "reactstrap";

import { Field } from "formik";
import { WizzardForm, FormStep } from "../../components/form/WizzardForm";
import { grantSchema } from "../../util/validation";

import TextInput from "../../components/form/TextInput";
import DateInput from "../../components/form/DateInput";
import SelectInput from "../../components/form/SelectInput";

export default function AddGrant({ toggle }) {
	return (
		<>
			<ModalHeader toggle={toggle}>Nový grant</ModalHeader>
			<ModalBody>
				{" "}
				<WizzardForm
					toggle={toggle}
					initialValues={{
						name: "",
						type: "APVV",
						idNumber: "",
						start: "",
						end: "",
					}}
					validationSchema={grantSchema}
					onSubmit={(values) => console.log(values)}
				>
					<FormStep>
						<Field
							name="type"
							label="Typ"
							options={[
								{ name: "APVV", value: "APVV" },
								{ name: "VEGA", value: "VEGA" },
								{ name: "KEGA", value: "KEGA" },
							]}
							component={SelectInput}
						/>
						<Field
							name="name"
							label="Nazov"
							placeholder="Nazov grantu..."
							component={TextInput}
						/>
						<Field
							name="idNumber"
							label="ID"
							placeholder="ID grantu..."
							component={TextInput}
						/>
						<Field
							name="start"
							label="Zaciatok"
							placeholder="Zaciatok grantu..."
							component={DateInput}
						/>
						<Field
							name="end"
							label="Koniec"
							placeholder="Koniec grantu..."
							component={DateInput}
						/>
					</FormStep>
					<FormStep>
						<Field
							name="material"
							label="Položka materiál"
							placeholder="Materiál..."
							component={TextInput}
						/>
						<Field
							name="services"
							label="Položka služby"
							placeholder="Služby..."
							component={TextInput}
						/>
						<Field
							name="travel"
							label="Položka cestovné"
							placeholder="Cestovné..."
							component={TextInput}
						/>
						<Field
							name="indirect"
							label="Položka nepriame"
							placeholder="Neprimae náklady..."
							component={TextInput}
						/>
						<Field
							name="salaries"
							label="Položka platy"
							placeholder="Nazov grantu..."
							component={TextInput}
						/>
					</FormStep>
				</WizzardForm>
			</ModalBody>
		</>
	);
}
