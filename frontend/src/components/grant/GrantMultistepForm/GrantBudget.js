import React from 'react';
import { Alert, Fade, Form, FormGroup, Row, Col, Label, Input, FormFeedback, Button, Table } from 'reactstrap';

import validateBudget from "../../../validation/validateBudget";
import useFormValidation from "../../../hooks/useFormValidation";

import GrantBudgetMembers from "./GrantBudgetMembers";

function GrantBudget(props) {
	const INITIAL_STATE = {
		year: props.year,
		travel: props.form.budget[props.i] ? props.form.budget[props.i].travel : "",
		material: props.form.budget[props.i] ? props.form.budget[props.i].material : "",
		services: props.form.budget[props.i] ? props.form.budget[props.i].services : "",
		indirect: props.form.budget[props.i] ? props.form.budget[props.i].indirect : "",
		members: props.form.budget[props.i] ? props.form.budget[props.i].members : []
	}

	const { handleSubmit, handleChange, handleBlur, values, setValues, errors, valid } = useFormValidation(INITIAL_STATE, validateBudget, addBudget);

	async function addBudget() {
		const form = {...props.form};
		const budget = [...form.budget];
		budget[props.i] = values;
		form.budget = budget;
		await props.setForm(form);
		props.setStep(props.step + 1);
	}

	return(
		<Fade>
			<Form onSubmit={handleSubmit}>
				<h2 className="text-center">Rozpočet {props.year}</h2>
		        <Row form className="justify-content-center">
		        	<Col sm={3}>
			          <FormGroup>
		            	<Label for="travel" >Cestovné:</Label>
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
			        <Col sm={3}>
			          <FormGroup>
			            <Label for="services" >Služby:</Label>
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
				<Col sm={3}>
			          <FormGroup>
			            <Label for="material" >Materiál:</Label>
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
					<Col sm={3}>
			          <FormGroup>
			            <Label for="indirect" >Nepriame:</Label>
			            <Input 
			            	id="indirect" 
			            	name="indirect" 
			            	placeholder="Položka pre materiál" 
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
		        <GrantBudgetMembers users={props.users} step={props.step} setValues={setValues} budget={values} />
		        {values.members.length === 0 && 
		        	<Row form className="justify-content-center">
    		        	<Col sm={6}>
    			        	<Alert color="danger" className="text-center">Nebol pridaný žiadny riešiteľ</Alert>
    			        </Col>
    		        </Row> 
		        }
		        <FormGroup row className="justify-content-center">
		            <Col sm={6}>
		              	<Row form className="justify-content-between">
							<Button outline color="primary" onClick={() => props.setStep(props.step - 1)}>Späť</Button>
		                	<Button outline color="success" type="submit" disabled={Object.keys(errors).length !== 0 || values.members.length === 0}>Ďalej</Button>
		              	</Row>
		            </Col>
				</FormGroup>
			</Form>  
		</Fade>
	);
}

export default GrantBudget; 