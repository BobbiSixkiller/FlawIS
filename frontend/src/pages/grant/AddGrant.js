import React from "react";
import { Formik, Form, ErrorMessage } from "formik";

import { ModalHeader, ModalBody, Button, Col, Row } from "reactstrap";

import { Field, FieldArray } from "formik";
//import { WizzardForm, FormStep } from "../../components/form/WizzardForm";
import { grantSchema, budgetSchema } from "../../util/validation";

import GrantID from "./GrandID";

import UserApiSearch from "../../components/user/UserApiSearch";
import TextInput from "../../components/form/TextInput";
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
              {/* namiesto fieldarray iba checkovat values a forEach vyrenderovat komponenty s budgetom */}
              <FieldArray name="budget">
                {() =>
                  props.values.budget.map((_, i) => (
                    <div key={i}>
                      <TextInput
                        name={`budget[${i}].material`}
                        label="Položka materiál"
                        placeholder="Materiál..."
                      />
                      <TextInput
                        name={`budget[${i}].services`}
                        label="Položka služby"
                        placeholder="Služby..."
                      />
                      <TextInput
                        name={`budget[${i}].travel`}
                        label="Položka cestovné"
                        placeholder="Cestovné..."
                      />
                      <TextInput
                        name={`budget[${i}].indirect`}
                        label="Položka nepriame"
                        placeholder="Neprimae náklady..."
                      />
                      <TextInput
                        name={`budget[${i}].salaries`}
                        label="Položka platy"
                        placeholder="Nazov grantu..."
                      />
                      {/* AddMember component ktory pushuje do FieldArray, nasledne map render s moznostou vymazania riesitela zo zoznamu */}
                      <FieldArray name={`budget[${i}].members`}>
                        {(arrayHelpers) =>
                          props.values.budget[i].members.map((m, index) => (
                            <div key={index}>
                              <Row>
                                <Col sm={8}>
                                  <UserApiSearch
                                    name={`budget[${i}].members[${index}].member`}
                                    label="Meno"
                                    placeholder="Meno riesitela..."
                                  />
                                </Col>
                                <Col sm={4}>
                                  <TextInput
                                    name={`budget[${i}].members[${index}].hours`}
                                    label="hodiny"
                                    placeholder="Hodiny..."
                                  />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={8}>
                                  <RadioInput
                                    name={`budget[${i}].members[${index}].role`}
                                    options={[
                                      { label: "Riesitel", value: "basic" },
                                      { label: "Zastupca", value: "deputy" },
                                      { label: "Hlavny", value: "leader" },
                                    ]}
                                  />
                                </Col>
                                <Col sm={4}>
                                  <Button
                                    onClick={() =>
                                      arrayHelpers.push({
                                        member: "",
                                        hours: "",
                                        role: "",
                                      })
                                    }
                                  >
                                    Pridat
                                  </Button>
                                </Col>
                              </Row>
                            </div>
                          ))
                        }
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
