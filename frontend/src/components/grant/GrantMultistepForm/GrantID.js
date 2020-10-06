import React from 'react';
import { Fade, Form, FormGroup, Col, Input, Label, FormFeedback, Button } from 'reactstrap'; 

import validateGrantID from "../../../validation/validateGrantID";
import useFormValidation from "../../../hooks/useFormValidation";

function GrantID(props) {
	const INITIAL_STATE = {
	  name: props.form.name ? props.form.name : "",
	  idNumber: props.form.idNumber ? props.form.idNumber : "",
	  type: props.form.type ? props.form.type : "APVV",
	  start: props.form.start ? props.form.start: "",
	  end: props.form.end ? props.form.end: "",
	  budget: props.form.budget ? props.form.budget : []
	}

	function addGrantID() {
		props.setForm(values);
		props.setStep(props.step + 1);
	}

	const { handleSubmit, handleChange, handleBlur, values, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateGrantID, addGrantID);

	React.useEffect(() => {
		props.setYears(getYears(values));
	}, [values.start, values.end]);

	function getYears(values) {
		const years = [];
		const start = new Date(values.start).getFullYear();
		const end = new Date(values.end).getFullYear();

		for(let i = start; i <= end; i++) {
			years.push(i.toString());
		};

		return years;
	}

	return(
		<Fade>
			<Form onSubmit={handleSubmit}>
				<h2 className="text-center">Grant ID</h2>
				<FormGroup row className="justify-content-center">
		          <Col sm={6}>
		            <Label for="name">Názov:</Label>
		            <Input
		            	type="textarea"
		                onChange={handleChange}
		                onBlur={handleBlur}
		                value={values.name}
		                invalid={errors.name && true}
		                valid={valid.name && true}
		                name="name"
		                id="name"
		                autoComplete="off"
		                placeholder="Názov grantu"
		            />
		            <FormFeedback invalid>{errors.name}</FormFeedback>
		            <FormFeedback valid>{valid.name}</FormFeedback>
		          </Col>
		        </FormGroup>
		        <FormGroup row className="justify-content-center">
		          <Col sm={6}>
		            <Label for="idNumber" >ID číslo:</Label>
		            <Input
		                onChange={handleChange}
		                onBlur={handleBlur}
		                value={values.idNumber}
		                invalid={errors.idNumber && true}
		                valid={valid.idNumber && true}
		                name="idNumber"
		                type="text"
		                id="idNumber"
		                autoComplete="off"
		                placeholder="ID číslo grantu"
		            />
		            <FormFeedback invalid>{errors.idNumber}</FormFeedback>
		            <FormFeedback valid>{valid.idNumber}</FormFeedback>
		          </Col>
		        </FormGroup>
		        <FormGroup row className="justify-content-center">
		          <Col sm={6}>
		            <Label for="type">Typ:</Label>
		            <Input type="select" name="type" id="type" value={values.type} onChange={handleChange}>
		              <option>APVV</option>
		              <option>VEGA</option>
		              <option>KEGA</option>
		            </Input>
		          </Col>
		        </FormGroup>
		        <FormGroup row className="justify-content-center">
		          <Col sm={6}>
		            <Label for="start" >Začiatok:</Label>
		            <Input
		                onChange={handleChange}
		                onBlur={handleBlur}
		                value={values.start}
		                invalid={errors.start && true}
		                valid={valid.start && true}
		                name="start"
		                type="date"
		                id="start"
		                autoComplete="off"
		                placeholder="Začiatok grantu"
		            />
		            <FormFeedback invalid>{errors.start}</FormFeedback>
		            <FormFeedback valid>{valid.start}</FormFeedback>
		          </Col>
		        </FormGroup>
		        <FormGroup row className="justify-content-center">
		          <Col sm={6}>
		            <Label for="end">Koniec:</Label>
		            <Input
		                onChange={handleChange}
		                onBlur={handleBlur}
		                value={values.end}
		                invalid={errors.end && true}
		                valid={valid.end && true}
		                name="end"
		                type="date"
		                id="end"
		                placeholder="Koniec grantu"
		            />
		            <FormFeedback invalid>{errors.end}</FormFeedback>
		            <FormFeedback valid>{valid.end}</FormFeedback>
		          </Col>
		        </FormGroup>
		        <FormGroup row className="justify-content-center">
	                <Col sm={6}>
	                  <FormGroup row className="justify-content-between">
	                    <Button className="ml-3" outline color="primary" onClick={() => props.history.goBack()}>Späť</Button>
	                    <Button className="mr-3" outline color="success" type="submit" disabled={Object.keys(errors).length !== 0}>Ďalej</Button>
	                  </FormGroup>
	                </Col>
	            </FormGroup>
		    </Form>
		</Fade>
	);
}

export default GrantID;