import React, { useEffect } from "react";
import { Field, useFormikContext } from "formik";

import TextInput from "../../components/form/TextInput";
import SelectInput from "../../components/form/SelectInput";
import DateInput from "../../components/form/DateInput";

export default function GrantID() {
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
        members: [],
      }))
    );
  }, [values.start, values.end]);

  return (
    <div>
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
    </div>
  );
}
