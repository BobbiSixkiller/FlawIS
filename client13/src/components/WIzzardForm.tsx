"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import {
  Children,
  Fragment,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  TextareaHTMLAttributes,
  useRef,
  useState,
} from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import { ObjectSchema } from "yup";
import Button from "./Button";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { Transition } from "@headlessui/react";

interface WizzardStepProps {
  children: ReactNode;
  validationSchema: ObjectSchema<any>;
}

export function WizzardStep({ children }: WizzardStepProps) {
  return <>{children}</>;
}

interface WizzardFormProps<T> {
  values: T;
  onSubmitCb: (values: T) => Promise<void>;
  children: ReactNode;
}

export function WizzardForm<T>({
  onSubmitCb,
  children,
  values,
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
      <form className="space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>
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
    </FormProvider>
  );
}

export function CheckBox({ name, label }: { name: string; label: string }) {
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(name);

  return (
    <div>
      <div className="flex items-center gap-x-3">
        <input
          {...register(name)}
          type="checkbox"
          className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-500 rounded-md"
        />
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}

export function Input({
  name,
  label,
  lng,
  ...props
}: {
  lng?: string;
  name: string;
  label: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const { register, getFieldState } = useFormContext();
  const [visible, setVisible] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setVisible(false));

  const { error } = getFieldState(name);
  const { error: localizedErr } = getFieldState(
    name.replace(lng || "en", lng === "sk" ? "en" : "sk")
  );

  return (
    <div ref={ref}>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          onFocus={() => {
            if (lng) {
              setVisible(true);
            }
          }}
          {...register(name)}
          placeholder={props.placeholder}
          className={
            props.type === "file"
              ? `block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4 file:rounded-md
              file:border-0 file:text-sm file:font-semibold
              file:bg-pink-50 file:text-pink-700
              hover:file:bg-pink-100`
              : "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
          }
          type={props.type}
        />
        {error && <p className="text-sm text-red-500">{error.message}</p>}
      </div>
      {lng && (
        <Transition
          as={Fragment}
          show={visible}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="mt-2">
            <label
              htmlFor={name.replace(lng || "en", lng === "sk" ? "en" : "sk")}
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {label} {lng === "sk" ? "anglicky" : "in Slovak"}
            </label>
            <div className="mt-2">
              <input
                onFocus={() => setVisible(true)}
                {...register(
                  name.replace(lng || "en", lng === "sk" ? "en" : "sk")
                )}
                placeholder={props.placeholder}
                className={
                  props.type === "file"
                    ? `block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4 file:rounded-md
                    file:border-0 file:text-sm file:font-semibold
                    file:bg-pink-50 file:text-pink-700
                    hover:file:bg-pink-100`
                    : "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                }
                type={props.type}
              />
              {localizedErr && (
                <p className="text-sm text-red-500">{localizedErr.message}</p>
              )}
            </div>
          </div>
        </Transition>
      )}
    </div>
  );
}

export function Textarea({
  name,
  label,
  lng,
  ...props
}: {
  lng?: string;
  name: string;
  label: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { register, getFieldState } = useFormContext();
  const [visible, setVisible] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setVisible(false));

  const { error } = getFieldState(name);
  const { error: localizedErr } = getFieldState(
    name.replace(lng || "en", lng === "sk" ? "en" : "sk")
  );

  return (
    <div ref={ref}>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <textarea
          onFocus={() => {
            if (lng) {
              setVisible(true);
            }
          }}
          {...register(name)}
          placeholder={props.placeholder}
          className={
            "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
          }
        />
        {error && <p className="text-sm text-red-500">{error.message}</p>}
      </div>
      {lng && (
        <Transition
          as={Fragment}
          show={visible}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="mt-2">
            <label
              htmlFor={name.replace(lng || "en", lng === "sk" ? "en" : "sk")}
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {label} {lng === "sk" ? "anglicky" : "in Slovak"}
            </label>
            <div className="mt-2">
              <textarea
                onFocus={() => setVisible(true)}
                {...register(
                  name.replace(lng || "en", lng === "sk" ? "en" : "sk")
                )}
                placeholder={props.placeholder}
                className={
                  "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                }
              />
              {localizedErr && (
                <p className="text-sm text-red-500">{localizedErr.message}</p>
              )}
            </div>
          </div>
        </Transition>
      )}
    </div>
  );
}

export function objectToFormData(
  obj: any,
  formData: FormData = new FormData(),
  parentKey: string = ""
): FormData {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let propName = parentKey ? `${parentKey}.${key}` : key;
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === "object" && !(item instanceof File)) {
            objectToFormData(item, formData, `${propName}[${index}]`);
          } else {
            formData.append(`${propName}.${index}`, item);
          }
        });
      } else if (typeof obj[key] === "object" && !(obj[key] instanceof File)) {
        objectToFormData(obj[key], formData, propName);
      } else {
        formData.append(propName, obj[key]);
      }
    }
  }
  return formData;
}
