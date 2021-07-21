import React, { useState } from "react";
import { Formik, Form } from "formik";

import { Row, Col, Button, Progress } from "reactstrap";

export function FormStep({ children }) {
	return <>{children}</>;
}

export function WizzardForm({ children, ...props }) {
	//const childrenArray = React.Children.toArray(children);
	const [step, setStep] = useState(0);
	//const currentStep = childrenArray[step];

	function isLastStep() {
		return step === children.length - 1;
	}

	return (
		<Formik
			{...props}
			onSubmit={async (values, helpers) => {
				if (isLastStep()) {
					await props.onSubmit(values, helpers);
				} else {
					console.log("NEXT");
					setStep((step) => step + 1);
					console.log(step);
				}
			}}
		>
			<Form autoComplete="off">
				{children[step]}

				<div className="my-5">
					<div className="text-center">{`${step} / ${children.length}`}</div>
					<Progress value={(step / children.length) * 100} />
				</div>
				<Row className="justify-content-between">
					<Col>
						<Button
							outline
							color="secondary"
							onClick={step === 0 ? props.toggle : setStep(step - 1)}
						>
							{step === 0 ? "Zrušiť" : "Späť"}
						</Button>
					</Col>
					<Col>
						<Button type="submit" color="success" className="float-right">
							{isLastStep() ? "Pridať" : "Ďalej"}
						</Button>
					</Col>
				</Row>
			</Form>
		</Formik>
	);
}
