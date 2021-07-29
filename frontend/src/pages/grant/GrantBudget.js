import React, { useEffect } from "react";
import { FieldArray, useFormikContext, Field } from "formik";

import { Row, Col, Button, FormGroup, CustomInput, Form } from "reactstrap";
import { Trash2Fill, PlusLg } from "react-bootstrap-icons";

import NumberInput from "../../components/form/NumberInput";
import RadioInput from "../../components/form/RadioInput";
import UserApiSearch from "../../components/user/UserApiSearch";

export default function GrantBudget({ index }) {
  const { values, setFieldValue, errors } = useFormikContext();

  useEffect(() => {
    values.budget.forEach((b, i) =>
      setFieldValue(`budget[${i}].members`, values.budget[index].members)
    );
  }, [values.budget[index].members, index, setFieldValue]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <div>
      <h5>Rozpocet {values.budget[index].year}</h5>
      <NumberInput
        name={`budget[${index}].material`}
        label="Položka materiál"
        placeholder="Materiál..."
      />
      <NumberInput
        name={`budget[${index}].services`}
        label="Položka služby"
        placeholder="Služby..."
      />
      <NumberInput
        name={`budget[${index}].travel`}
        label="Položka cestovné"
        placeholder="Cestovné..."
      />
      <NumberInput
        name={`budget[${index}].indirect`}
        label="Položka nepriame"
        placeholder="Neprimae náklady..."
      />
      <NumberInput
        name={`budget[${index}].salaries`}
        label="Položka platy"
        placeholder="Nazov grantu..."
      />
      <FieldArray name={`budget[${index}].members`}>
        {(arrayHelpers) => (
          <>
            <Row form>
              <Col>
                <h5>Riesitelia</h5>
              </Col>
              <Col>
                <Button
                  className="float-right"
                  color="success"
                  outline
                  onClick={() =>
                    arrayHelpers.push({
                      name: "",
                      member: "",
                      hours: 0,
                      role: "basic",
                    })
                  }
                >
                  <PlusLg />
                </Button>
              </Col>
            </Row>
            {values.budget[index].members.map((m, i) => (
              <div key={i}>
                <Row>
                  <Col sm={8}>
                    <UserApiSearch
                      name={`budget[${index}].members[${i}].name`}
                      member={`budget[${index}].members[${i}].member`}
                      label="Meno"
                      placeholder="Meno riesitela..."
                    />
                  </Col>
                  <Col sm={4}>
                    <NumberInput
                      name={`budget[${index}].members[${i}].hours`}
                      label="hodiny"
                      placeholder="Hodiny..."
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={8}>
                    <FormGroup>
                      {/* <RadioInput
                        type="radio"
                        name={`budget[${index}].members[${i}].role`}
                        id="basic"
                        value="basic"
                        label="Riešiteľ"
                        inline
                      />
                      <RadioInput
                        type="radio"
                        name={`budget[${index}].members[${i}].role`}
                        id="deputy"
                        value="deputy"
                        label="Zástupca"
                        inline
                      />
                      <RadioInput
                        type="radio"
                        name={`budget[${index}].members[${i}].role`}
                        id="leader"
                        value="leader"
                        label="Hlavný"
                        inline
                      /> */}
                      <label>
                        <Field
                          type="radio"
                          name={`budget[${index}].members[${i}].role`}
                          value="basic"
                        />
                        Basic
                      </label>
                      <label>
                        <Field
                          type="radio"
                          name={`budget[${index}].members[${i}].role`}
                          value="deputy"
                        />
                        Deputy
                      </label>
                      <label>
                        <Field
                          type="radio"
                          name={`budget[${index}].members[${i}].role`}
                          value="lader"
                        />
                        Leader
                      </label>
                    </FormGroup>
                  </Col>
                  <Col sm={4}>
                    <Button
                      outline
                      color="danger"
                      onClick={() => arrayHelpers.remove(i)}
                    >
                      <Trash2Fill />
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </>
        )}
      </FieldArray>
    </div>
  );
}
