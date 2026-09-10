"use client";

import { useTranslation } from "@/lib/i18n/client";
import {
  Children,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import Button from "./Button";
import { FormContainer, FormError } from "./form";
import Icon from "./Icon";
import Spinner from "./Spinner";
import Stepper from "./Stepper";

interface WizzardStepProps<
  TValues extends FieldValues,
  TOutput extends FieldValues = TValues,
> {
  id: string;
  name: string;
  fields: Path<TValues>[];
  children:
    | ((methods: UseFormReturn<TValues, unknown, TOutput>) => ReactNode)
    | ReactNode;
}
export function WizzardStep<
  TValues extends FieldValues = FieldValues,
  TOutput extends FieldValues = TValues,
>({ children }: WizzardStepProps<TValues, TOutput>) {
  return <>{typeof children === "function" ? null : children}</>;
}
interface WizzardFormProps<S extends z.ZodType<FieldValues, FieldValues>> {
  schema: S;
  lng: string;
  defaultValues?: DefaultValues<z.input<S>>;
  values?: z.input<S>;
  onSubmitCb: (
    values: z.output<S>,
    methods: UseFormReturn<z.input<S>, unknown, z.output<S>>,
  ) => Promise<void>;
  children: ReactNode;
  className?: string;
}
export default function WizzardForm<
  S extends z.ZodType<FieldValues, FieldValues>,
>({ schema, defaultValues, values, ...props }: WizzardFormProps<S>) {
  return (
    <FormContainer
      schema={schema}
      defaultValues={defaultValues}
      values={values}
      shouldUnregister={false}
    >
      {(methods) => <WizardBody {...props} methods={methods} />}
    </FormContainer>
  );
}

export function firstErrorPath(
  errors: unknown,
  prefix = "",
): string | undefined {
  if (!errors || typeof errors !== "object") return undefined;
  if ("message" in errors && typeof errors.message === "string") return prefix;
  for (const [key, value] of Object.entries(errors)) {
    if (["ref", "type", "types"].includes(key)) continue;
    const result = firstErrorPath(
      value,
      key === "root" ? prefix : prefix ? `${prefix}.${key}` : key,
    );
    if (result) return result;
  }
}
function WizardBody<TValues extends FieldValues, TOutput extends FieldValues>({
  children,
  methods,
  onSubmitCb,
  lng,
  className,
}: {
  children: ReactNode;
  methods: UseFormReturn<TValues, unknown, TOutput>;
  onSubmitCb: (
    values: TOutput,
    methods: UseFormReturn<TValues, unknown, TOutput>,
  ) => Promise<void>;
  lng: string;
  className?: string;
}) {
  const steps = Children.toArray(children) as ReactElement<
    WizzardStepProps<TValues, TOutput>
  >[];
  const [activeId, setActiveId] = useState(steps[0]?.props.id);
  const [focusPath, setFocusPath] = useState<Path<TValues>>();
  const [advancing, setAdvancing] = useState(false);
  const step = Math.max(
    0,
    steps.findIndex((s) => s.props.id === activeId),
  );
  const activeStep = steps[step];
  const last = step === steps.length - 1;
  const { t } = useTranslation(lng, "common");
  useEffect(() => {
    if (!focusPath) return;
    // Both the destination step and an expanded localized field must mount first.
    const timeout = setTimeout(() => {
      methods.setFocus(focusPath);
      setFocusPath(undefined);
    }, 0);
    return () => clearTimeout(timeout);
  }, [focusPath, methods, step]);
  function navigate(path?: string) {
    if (!path) return;
    const target = steps.find((s) =>
      s.props.fields.some(
        (field) => path === field || path.startsWith(`${field}.`),
      ),
    );
    if (target) {
      setActiveId(target.props.id);
      setFocusPath(path as Path<TValues>);
    }
  }
  function navigateErrors(errors?: FieldErrors<TValues>) {
    if (errors) {
      navigate(firstErrorPath(errors));
      return;
    }
    for (const s of steps)
      for (const field of s.props.fields) {
        const error = methods.getFieldState(field).error;
        if (error) {
          navigate(firstErrorPath(error, field));
          return;
        }
      }
  }
  if (!activeStep) return null;
  return (
    <div className="flex flex-col gap-6">
      <Stepper activeIndex={step} lng={lng} steps={steps} />
      <form
        className={className}
        onSubmit={async (event) => {
          event.preventDefault();
          if (advancing || methods.formState.isSubmitting) return;
          if (!last) {
            setAdvancing(true);
            try {
              if (
                await methods.trigger(activeStep.props.fields, {
                  shouldFocus: true,
                })
              ) {
                setActiveId(steps[step + 1].props.id);
              } else {
                navigateErrors();
              }
            } finally {
              setAdvancing(false);
            }
            return;
          }
          await methods.handleSubmit(async (values) => {
            try {
              await onSubmitCb(values, methods);
            } catch (error: unknown) {
              if (
                error &&
                typeof error === "object" &&
                !(error instanceof Error)
              ) {
                for (const [field, message] of Object.entries(error))
                  if (typeof message === "string")
                    methods.setError(field as Path<TValues>, {
                      type: "server",
                      message,
                    });
              } else
                methods.setError("root", {
                  message: error instanceof Error ? error.message : t("error"),
                });
            }
            navigateErrors();
          }, navigateErrors)(event);
        }}
      >
        <div key={activeStep.props.id} className="contents">
          {typeof activeStep.props.children === "function"
            ? activeStep.props.children(methods)
            : activeStep.props.children}
        </div>
        <FormError />
        <div className="flex justify-between mt-6">
          {steps.length > 1 && (
            <Button
              color="secondary"
              type="button"
              onClick={() => setActiveId(steps[step - 1].props.id)}
              disabled={step === 0 || methods.formState.isSubmitting}
              aria-label={t("previous")}
            >
              <Icon name="chevron-left" className="h-4 w-4" />
              <span className="hidden md:inline">{t("previous")}</span>
            </Button>
          )}
          <Button
            className={steps.length === 1 ? "w-full" : ""}
            color="primary"
            type="submit"
            disabled={advancing || methods.formState.isSubmitting}
            aria-label={t(last ? "submit" : "next")}
          >
            {advancing || methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : last ? (
              <>
                <Icon name="check" className="h-4 w-4" />
                <span className="hidden md:inline">{t("submit")}</span>
              </>
            ) : (
              <>
                <span className="hidden md:inline">{t("next")}</span>
                <Icon name="chevron-right" className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
