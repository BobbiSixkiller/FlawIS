import React, { useState, Children } from "react";
import { Formik, Form } from "formik";

import { Button, Progress, Alert, Spinner } from "reactstrap";

export function FormStep({ children }) {
	return <>{children}</>;
}

export function WizzardForm({
	children,
	initialValues,
	initialStatus,
	onSubmit,
	...props
}) {
	const steps = Children.toArray(children);
	const [stepNumber, setStepNumber] = useState(0);
	const [snapshot, setSnapshot] = useState(initialValues);

	const step = steps[stepNumber];
	const isLastStep = stepNumber === steps.length - 1;

	const next = (values) => {
		setSnapshot(values);
		setStepNumber(Math.min(stepNumber + 1, steps.length - 1));
	};

	const previous = (values) => {
		setSnapshot(values);
		if (stepNumber === 0) {
			props.toggle();
		} else {
			setStepNumber(Math.max(stepNumber - 1, 0));
		}
	};

	return (
		<Formik
			initialValues={snapshot}
			initialStatus={initialStatus}
			validationSchema={step.props.validationSchema}
			onSubmit={async (values, helpers) => {
				if (step.props.onSubmit) {
					await step.props.onSubmit(values, helpers);
				}
				if (isLastStep) {
					return onSubmit(values, helpers);
				} else {
					helpers.setTouched({});
					next(values);
				}
			}}
		>
			{({ isSubmitting, values, status, setStatus }) => (
				<Form autoComplete="off">
					{step}

					<div className="my-5">
						<div className="text-center">{`${stepNumber + 1} / ${
							steps.length
						}`}</div>
						<Progress value={((stepNumber + 1) / steps.length) * 100} />
					</div>

					{status && (
						<Alert
							color={status.success ? "success" : "danger"}
							isOpen={status.message.length !== 0}
							toggle={() => setStatus({ ...status, message: "" })}
						>
							{status.message}
							{status.errors && status.errors.length !== 0 && (
								<>
									<hr />
									<ul>
										{status.errors.map((e) => (
											<li key={e.path}>{e.message}</li>
										))}
									</ul>
								</>
							)}
						</Alert>
					)}

					<Button
						type="button"
						outline
						color="secondary"
						onClick={() => previous(values)}
					>
						{stepNumber === 0 ? "Zrušiť" : "Späť"}
					</Button>

					<Button
						outline={!isLastStep}
						type="submit"
						color="success"
						className="float-right"
						disabled={isSubmitting}
					>
						{isLastStep ? (
							isSubmitting ? (
								<Spinner size="sm" color="light" />
							) : (
								"Pridať"
							)
						) : (
							"Ďalej"
						)}
					</Button>
				</Form>
			)}
		</Formik>
	);
}
