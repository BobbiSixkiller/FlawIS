import React from "react";

import { grantSchema } from "../../util/validation";

import TextInput from "../../components/form/TextInput";
import DateInput from "../../components/form/DateInput";
import SelectInput from "../../components/form/SelectInput";

import { ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Formik, Form, Field } from "formik";

export default function AddGrant({ toggle }) {
  return (
    <>
      <ModalHeader toggle={toggle}>ADD GRANT</ModalHeader>
      <ModalBody>
        <Formik
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
          {() => (
            <Form autoComplete="off">
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
            </Form>
          )}
        </Formik>
      </ModalBody>
      <ModalFooter>CONTROLS</ModalFooter>
    </>
  );
}
