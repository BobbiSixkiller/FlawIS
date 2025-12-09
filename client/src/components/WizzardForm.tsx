"use client";

import { Children, ReactElement, ReactNode, useState } from "react";
import { DefaultValues, Path, UseFormReturn } from "react-hook-form";
import { ObjectSchema } from "yup";
import RHFormContainer from "./RHFormContainer";
import Stepper from "./Stepper";
import Button from "./Button";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Spinner from "./Spinner";

interface WizzardStepProps<TVals extends Record<string, any>> {
  name: string;
  yupSchema: ObjectSchema<TVals>;
  children: ((methods: UseFormReturn<TVals>) => ReactNode) | ReactNode;
}

export function WizzardStep<TVals extends Record<string, any>>({
  children,
}: WizzardStepProps<TVals>) {
  return <>{children}</>;
}

interface WizzardFormProps<TVals extends Record<string, any>> {
  lng: string;
  defaultValues?: DefaultValues<TVals>;
  values?: TVals;
  onSubmitCb: (values: TVals, methods: UseFormReturn<TVals>) => Promise<void>;
  children: ReactNode;
  className?: string;
}

export default function WizzardForm<TInputVals extends Record<string, any>>({
  children,
  lng,
  values,
  defaultValues,
  onSubmitCb,
  className,
}: WizzardFormProps<TInputVals>) {
  const steps = Children.toArray(children) as ReactElement<
    WizzardStepProps<TInputVals>
  >[];

  const [step, setStep] = useState(0);

  function isLastStep() {
    return step === steps.length - 1;
  }

  function back() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  const activeStep = steps[step];

  function handleApiErrors(
    apiErrors: Record<string, string>,
    methods: UseFormReturn<TInputVals>
  ) {
    const firstField = Object.keys(apiErrors)[0];

    // Determine step index based on field names and schema
    const stepIndex = steps.findIndex((step) => {
      const keys = Object.keys(step.props.yupSchema.fields);
      console.log(keys);

      return keys.some(
        (k) => firstField === k || firstField.startsWith(`${k}.`)
      );
    });

    if (stepIndex !== -1) {
      setStep(stepIndex);
    }

    setTimeout(() => {
      for (const [key, msg] of Object.entries(apiErrors)) {
        methods.setError(
          key as Path<TInputVals>,
          {
            message: msg,
          },
          { shouldFocus: true }
        );
      }
    }, 0);
  }

  return (
    <div className="flex flex-col gap-6">
      <Stepper activeIndex={step} lng={lng} steps={steps} />
      <RHFormContainer<TInputVals>
        values={values}
        defaultValues={defaultValues}
        yupSchema={steps[step].props.yupSchema}
        shouldUnregister={false}
      >
        {(methods) => (
          <form
            className={className}
            onSubmit={methods.handleSubmit(
              async (vals) => {
                try {
                  if (isLastStep()) {
                    await onSubmitCb(vals, methods);
                  } else {
                    setStep(step + 1);
                  }
                } catch (errors: any) {
                  console.log(errors);
                  if (errors && typeof errors === "object") {
                    handleApiErrors(errors, methods);
                  }
                }
              },
              (err) => console.log(err)
            )}
          >
            {typeof activeStep.props.children === "function"
              ? activeStep.props.children(methods)
              : activeStep.props.children}

            <div className="flex justify-between mt-6">
              {steps.length > 1 && (
                <Button
                  color="secondary"
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                className={steps.length === 1 ? "w-full" : ""}
                color="primary"
                type="submit"
                disabled={methods.formState.isSubmitting}
              >
                {methods.formState.isSubmitting ? (
                  <Spinner inverted />
                ) : isLastStep() ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        )}
      </RHFormContainer>
    </div>
  );
}
