import React from "react";

import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  Alert,
} from "reactstrap";

import { validateBudget } from "../../util/validation";
import useFormValidation from "../../hooks/useFormValidation";
import { useDataSend } from "../../hooks/useApi";

export default function EditBudget({ toggle, modalData }) {
  const INITIAL_STATE = {
    travel: modalData.budget.travel,
    material: modalData.budget.material,
    services: modalData.budget.services,
    indirect: modalData.budget.indirect,
    salaries: modalData.budget.salaries,
  };

  const { loading, error, data, sendData, hideMessage } = useDataSend();

  const { handleSubmit, handleChange, handleBlur, values, errors, valid } =
    useFormValidation(INITIAL_STATE, validateBudget, editBudget);

  function editBudget() {
    sendData(
      `grant/${modalData.grantId}/budget/${modalData.budget._id}`,
      "PUT",
      values
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>
        Upraviť rozpočet {new Date(modalData.budget.year).getFullYear()}
      </ModalHeader>
      <ModalBody>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="travel">Cestovné:</Label>
              <Input
                id="travel"
                name="travel"
                placeholder="Položka pre cestovné"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.travel}
                invalid={errors.travel && true}
                valid={valid.travel && true}
                autoComplete="off"
              />
              <FormFeedback invalid>{errors.travel}</FormFeedback>
              <FormFeedback valid>{valid.travel}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="services">Služby:</Label>
              <Input
                id="services"
                name="services"
                placeholder="Položka pre služby"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.services}
                invalid={errors.services && true}
                valid={valid.services && true}
                autoComplete="off"
              />
              <FormFeedback invalid>{errors.services}</FormFeedback>
              <FormFeedback valid>{valid.services}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="material">Materiál:</Label>
              <Input
                id="material"
                name="material"
                placeholder="Položka pre materiál"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.material}
                invalid={errors.material && true}
                valid={valid.material && true}
                autoComplete="off"
              />
              <FormFeedback invalid>{errors.material}</FormFeedback>
              <FormFeedback valid>{valid.material}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="indirect">Nepriame:</Label>
              <Input
                id="indirect"
                name="indirect"
                placeholder="Položka pre nepriame náklady"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.indirect}
                invalid={errors.indirect && true}
                valid={valid.indirect && true}
                autoComplete="off"
              />
              <FormFeedback invalid>{errors.indirect}</FormFeedback>
              <FormFeedback valid>{valid.indirect}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        <Row form className="justify-content-center">
          <Col>
            <FormGroup>
              <Label for="salaries">Mzdy:</Label>
              <Input
                id="salaries"
                name="salaries"
                placeholder="Položka pre nepriame náklady"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.salaries}
                invalid={errors.salaries && true}
                valid={valid.salaries && true}
                autoComplete="off"
              />
              <FormFeedback invalid>{errors.salaries}</FormFeedback>
              <FormFeedback valid>{valid.salaries}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        {data && (
          <Row row className="justify-content-center my-3">
            <Col>
              <Alert color={error ? "danger" : "success"}>
                {data.msg}
                <Button close onClick={hideMessage} />
              </Alert>
            </Col>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="submit" color="warning" disabled={loading}>
          Upraviť
        </Button>{" "}
        <Button outline color="secondary" onClick={toggle}>
          Zrušiť
        </Button>
      </ModalFooter>
    </Form>
  );
}
