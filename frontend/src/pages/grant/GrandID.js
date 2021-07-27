import React, { useEffect } from "react";
import { useFormikContext } from "formik";

import TextInput from "../../components/form/TextInput";
import SelectInput from "../../components/form/SelectInput";
import DateInput from "../../components/form/DateInput";

export default function GrantID({ setBudgets }) {
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
    setFieldValue(
      "budget",
      years.map((year) => ({
        year,
        travel: "",
        material: "",
        services: "",
        salaries: "",
        indirect: "",
        members: [{ member: "", role: "basic", hours: "" }],
      }))
    );
    setBudgets(
      years.map((year) => ({
        year,
        travel: "",
        material: "",
        services: "",
        salaries: "",
        indirect: "",
        members: [{ member: "", role: "basic", hours: "" }],
      }))
    );
  }, [values.start, values.end, setFieldValue]);

  useEffect(() => {
    console.log(values);
  }, [values]);

  return (
    <div>
      <SelectInput
        name="type"
        label="Typ"
        options={[
          { name: "APVV", value: "APVV" },
          { name: "VEGA", value: "VEGA" },
          { name: "KEGA", value: "KEGA" },
        ]}
      />
      <TextInput name="name" label="Nazov" placeholder="Nazov grantu..." />
      <TextInput name="idNumber" label="ID" placeholder="ID grantu..." />
      <DateInput
        name="start"
        label="Zaciatok"
        placeholder="Zaciatok grantu..."
      />
      <DateInput name="end" label="Koniec" placeholder="Koniec grantu..." />
    </div>
  );
}
