import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { ModalHeader, ModalBody, Button } from "reactstrap";

import { WizzardForm, FormStep } from "../../components/form/WizzardForm";
import { grantSchema, grantBudgetSchema } from "../../util/validation";

import GrantID from "./GrandID";
import GrantBudget from "./GrantBudget";

export default function AddGrant({ toggle }) {
  const [budgets, setBudgets] = useState([]);
  const [step, setStep] = useState(0);

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
          onSubmit={(values) => console.log(values)}
        >
          {/* {({ values }) => ( */}
          {/* <Form> */}
          <FormStep
            onSubmit={() => console.log("GRANT ID SUBMIT")}
            validationSchema={grantSchema}
          >
            <GrantID setBudgets={setBudgets} />
          </FormStep>
          {budgets.map((_, i) => (
            <FormStep
              onSubmit={() => console.log("GRANT BUDGET SUBMIT")}
              validationSchema={grantBudgetSchema}
              key={i}
            >
              <GrantBudget index={i} />
            </FormStep>
          ))}

          {/* <Button type="button" outline color="secondary" onClick={toggle}>
              Zrušiť
            </Button>

            <Button type="submit" color="success" className="float-right">
              Pridať
            </Button> */}
          {/* </Form> */}
          {/* )} */}
        </WizzardForm>
      </ModalBody>
    </>
  );
}
