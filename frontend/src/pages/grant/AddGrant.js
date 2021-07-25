import React from "react";
import { Formik, Form } from "formik";

import { ModalHeader, ModalBody, Button } from "reactstrap";

import { Field, FieldArray } from "formik";
//import { WizzardForm, FormStep } from "../../components/form/WizzardForm";
import { grantSchema, budgetSchema } from "../../util/validation";

import GrantID from "./GrandID";

import TextInput from "../../components/form/TextInput";
import DateInput from "../../components/form/DateInput";
import SelectInput from "../../components/form/SelectInput";
import RadioInput from "../../components/form/RadioInput";

export default function AddGrant({ toggle }) {
  return (
    <>
      <ModalHeader toggle={toggle}>Nový grant</ModalHeader>
      <ModalBody>
        <Formik
          //toggle={toggle}
          initialValues={{
            name: "",
            type: "APVV",
            idNumber: "",
            start: "",
            end: "",
            budget: [],
          }}
          validationSchema={grantSchema}
          onSubmit={(values) => console.log(values)}
        >
          {(props) => (
            <Form>
              <GrantID />
              <FieldArray name="budget">
                {() =>
                  props.values.budget.map((b, i) => (
                    <div key={i}>
                      <Field
                        name={`budget[${i}].material`}
                        label="Položka materiál"
                        placeholder="Materiál..."
                        component={TextInput}
                      />
                      <Field
                        name={`budget[${i}].services`}
                        label="Položka služby"
                        placeholder="Služby..."
                        component={TextInput}
                      />
                      <Field
                        name={`budget[${i}].travel`}
                        label="Položka cestovné"
                        placeholder="Cestovné..."
                        component={TextInput}
                      />
                      <Field
                        name={`budget[${i}].indirect`}
                        label="Položka nepriame"
                        placeholder="Neprimae náklady..."
                        component={TextInput}
                      />
                      <Field
                        name={`budget[${i}].salaries`}
                        label="Položka platy"
                        placeholder="Nazov grantu..."
                        component={TextInput}
                      />
                      {/* AddMember component ktory pushuje do FieldArray, nasledne map render s moznostou vymazania riesitela zo zoznamu */}
                      <FieldArray name={`budget[${i}].members`}>
                        {(arrayHelpers) => (
                          <div>
                            <Field
                              name={`budget[${i}].members`}
                              label="Meno"
                              placeholder="Meno riesitela..."
                              component={TextInput}
                            />
                            <Field
                              name={`budget[${i}].members`}
                              label="Typ"
                              placeholder="Typ riesitela..."
                              component={TextInput}
                            />
                            <Field
                              name={`budget[${i}].members`}
                              label="hodiny"
                              placeholder="Hodiny..."
                              component={TextInput}
                            />
                            <Button
                              onClick={() =>
                                arrayHelpers.push({
                                  member: "id123",
                                  hours: "1",
                                  role: "leader",
                                })
                              }
                            >
                              +MEMBER
                            </Button>
                            {props.values.budget[i].members.map((m, i) => (
                              <div key={i}>MEMBER {i}</div>
                            ))}
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  ))
                }
              </FieldArray>
              <Button type="button" outline color="secondary" onClick={toggle}>
                Zrušiť
              </Button>

              <Button type="submit" color="success" className="float-right">
                Pridať
              </Button>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </>
  );
}
