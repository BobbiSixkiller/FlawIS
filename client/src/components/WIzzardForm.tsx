"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Children, ReactElement, ReactNode, useState } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { ObjectSchema } from "yup";
import Button from "./Button";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Stepper from "./Stepper";
import { FormMessage } from "./Message";

interface WizzardStepProps {
  children: ReactNode;
  validationSchema: ObjectSchema<any>;
  name: string;
}

export function WizzardStep({ children }: WizzardStepProps) {
  return <>{children}</>;
}

interface WizzardFormProps<T> {
  lng: string;
  values: T;
  onSubmitCb: (values: T) => Promise<void>;
  children: ReactNode;
}

export function WizzardForm<T>({
  onSubmitCb,
  children,
  values,
  lng,
}: WizzardFormProps<T & FieldValues>) {
  const steps = Children.toArray(children) as ReactElement<WizzardStepProps>[];
  const [step, setStep] = useState(0);
  const currentStep = steps[step];

  function isLastStep() {
    return step === steps.length - 1;
  }

  const methods = useForm<typeof values>({
    resolver: yupResolver(currentStep.props.validationSchema),
    values,
  });

  function back() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  const onSubmit: SubmitHandler<typeof values> = async (data) => {
    if (isLastStep()) {
      await onSubmitCb(data);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full flex flex-col gap-6">
        <Stepper activeIndex={step} steps={steps} lng={lng} />
        <FormMessage />
        <form
          className="space-y-6 w-full md:max-w-96 mx-auto"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          {steps[step]}
          <div className="flex justify-between">
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
              fluid={steps.length === 1}
              color="primary"
              type="submit"
              loading={methods.formState.isSubmitting}
              disabled={methods.formState.isSubmitting}
            >
              {isLastStep() ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

export function objectToFormData(
  obj: any,
  formData: FormData = new FormData(),
  parentKey: string = ""
): FormData {
  for (let key in obj) {
    if (
      obj.hasOwnProperty(key) &&
      obj[key] !== null &&
      obj[key] !== undefined
    ) {
      const propName = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any) => {
          if (item !== null && item !== undefined) {
            if (item instanceof File) {
              // Append each file under the same key
              formData.append(propName, item);
              console.log(`Appending file under key: ${propName}`);
            } else if (typeof item === "object") {
              // Recursive call for objects that are not Files
              objectToFormData(item, formData, propName);
            } else {
              // Append non-object items
              formData.append(propName, item);
            }
          }
        });
      } else if (obj[key] instanceof File) {
        // Directly append File objects
        formData.append(propName, obj[key]);
        console.log(`Appending file under key: ${propName}`);
      } else if (typeof obj[key] === "object") {
        // Recursive call for nested objects
        objectToFormData(obj[key], formData, propName);
      } else {
        // Append primitive values
        formData.append(propName, obj[key]);
      }
      console.log(`Appending key: ${propName}, value: ${obj[key]}`);
    }
  }
  return formData;
}
