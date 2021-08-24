import React, { useEffect } from "react";
import { useFormikContext } from "formik";

import TextInput from "../../form/TextInput";
import SelectInput from "../../form/SelectInput";
import DateInput from "../../form/DateInput";

export default function GrantID({ setYears }) {
	const { values, setFieldValue } = useFormikContext();

	useEffect(() => {
		const start = new Date(values.start).getFullYear();
		const end = new Date(values.end).getFullYear();

		function getYears(start, end) {
			const years = [];
			for (let year = start; year <= end; year++) {
				years.push(year);
			}

			return years;
		}

		const years = getYears(start, end);
		setYears(years);
		setFieldValue(
			"budget",
			years.map((year) => ({
				year: year.toString(),
				travel: 0,
				material: 0,
				services: 0,
				salaries: 0,
				indirect: 0,
				members: [{ member: "", name: "", role: "basic", hours: 1 }],
			}))
		);
	}, [values.start, values.end, setYears, setFieldValue]);

	return (
		<>
			<SelectInput
				name="type"
				label="Typ"
				options={[
					{ name: "APVV", value: "APVV" },
					{ name: "VEGA", value: "VEGA" },
					{ name: "KEGA", value: "KEGA" },
				]}
			/>
			<TextInput
				type="textarea"
				name="name"
				label="Nazov"
				placeholder="Nazov grantu..."
			/>
			<TextInput
				type="text"
				name="idNumber"
				label="ID"
				placeholder="ID grantu..."
			/>
			<DateInput
				name="start"
				label="Zaciatok"
				placeholder="Zaciatok grantu..."
			/>
			<DateInput name="end" label="Koniec" placeholder="Koniec grantu..." />
		</>
	);
}
