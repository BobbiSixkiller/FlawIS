import React from "react";
import { FieldArray, useFormikContext } from "formik";

import { Row, Col, Button } from "reactstrap";
import { Trash2Fill, PlusLg } from "react-bootstrap-icons";

import TextInput from "../../components/form/TextInput";
import RadioInput from "../../components/form/RadioInput";
import UserApiSearch from "../../components/user/UserApiSearch";

export default function GrantBudget({ index }) {
  const { values, errors } = useFormikContext();
  console.log(errors);

  return (
    <div>
      <h5>Rozpocet {values.budget[index].year}</h5>
      <TextInput
        name={`budget[${index}].material`}
        label="Položka materiál"
        placeholder="Materiál..."
      />
      <TextInput
        name={`budget[${index}].services`}
        label="Položka služby"
        placeholder="Služby..."
      />
      <TextInput
        name={`budget[${index}].travel`}
        label="Položka cestovné"
        placeholder="Cestovné..."
      />
      <TextInput
        name={`budget[${index}].indirect`}
        label="Položka nepriame"
        placeholder="Neprimae náklady..."
      />
      <TextInput
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
                      member: "",
                      hours: "",
                      role: "",
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
                      name={`budget[${index}].members[${i}].member`}
                      label="Meno"
                      placeholder="Meno riesitela..."
                    />
                  </Col>
                  <Col sm={4}>
                    <TextInput
                      name={`budget[${index}].members[${i}].hours`}
                      label="hodiny"
                      placeholder="Hodiny..."
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={8}>
                    <RadioInput
                      name={`budget[${index}].members[${i}].role`}
                      options={[
                        { label: "Riesitel", value: "basic" },
                        { label: "Zastupca", value: "deputy" },
                        { label: "Hlavny", value: "leader" },
                      ]}
                    />
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
