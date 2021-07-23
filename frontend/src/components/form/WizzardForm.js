import React, { useState, Children } from "react";
import { Formik, Form } from "formik";

import { Button, Progress } from "reactstrap";

export function FormStep({ children, ...props }) {
	console.log(props);
	return <>{children}</>;
}

export function WizzardForm({ children, ...props }) {
	const childrenArray = Children.toArray(children);
	const [step, setStep] = useState(0);
	const currentStep = childrenArray[step];

	console.log(currentStep);

	function isLastStep() {
		return step === children.length - 1;
	}

	function toggle() {
		if (step === 0) {
			return props.toggle();
		} else {
			return setStep((s) => s - 1);
		}
	}

	return (
		<Formik
			{...props}
			validationSchema={children[step].props.validationSchema}
			onSubmit={async (values, helpers) => {
				console.log("SUBMIT");
				if (isLastStep()) {
					await props.onSubmit(values, helpers);
				} else {
					setStep((s) => s + 1);
				}
			}}
		>
			<Form autoComplete="off">
				{currentStep}

				<div className="my-5">
					<div className="text-center">{`${step + 1} / ${
						children.length
					}`}</div>
					<Progress value={(step + 1 / children.length) * 100} />
				</div>

				<Button type="button" outline color="secondary" onClick={toggle}>
					{step === 0 ? "Zrušiť" : "Späť"}
				</Button>

				<Button type="submit" color="success" className="float-right">
					{isLastStep() ? "Pridať" : "Ďalej"}
				</Button>
			</Form>
		</Formik>
	);
}
