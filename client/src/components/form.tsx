"use client";

import useOnClickOutside from "@/hooks/useOnClickOutside";
import { cn } from "@/lib/utilsClient";
import { Description, Field, Label } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { get } from "lodash";
import {
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  type ControllerFieldState,
  type ControllerRenderProps,
  type DefaultValues,
  type FieldErrors,
  type FieldError,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";

export interface FormContainerProps<
  TSchema extends z.ZodType<FieldValues, FieldValues>,
> {
  schema: TSchema;
  defaultValues?: DefaultValues<z.input<TSchema>>;
  values?: z.input<TSchema>;
  errors?: FieldErrors<z.input<TSchema>>;
  shouldUnregister?: boolean;
  children: (
    methods: UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>>,
  ) => ReactNode;
}

export function FormContainer<
  TSchema extends z.ZodType<FieldValues, FieldValues>,
>({ schema, children, ...options }: FormContainerProps<TSchema>) {
  const methods = useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  });
  return <FormProvider {...methods}>{children(methods)}</FormProvider>;
}

export interface FormFieldRenderArgs<
  TValues extends FieldValues,
  TName extends Path<TValues>,
> {
  field: ControllerRenderProps<TValues, TName>;
  fieldState: ControllerFieldState;
  id: string;
  initialize: (value: PathValue<TValues, TName>) => void;
  onError: (message: string, errors?: Record<string, string>) => void;
  itemErrors: Record<number, string>;
  controlProps: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
    "aria-labelledby"?: string;
  };
}

export interface FormFieldProps<
  TValues extends FieldValues,
  TName extends Path<TValues>,
> {
  name: TName;
  label?: ReactNode;
  labelAction?: ReactNode;
  description?: ReactNode;
  className?: string;
  layout?: "stacked" | "inline";
  children: (args: FormFieldRenderArgs<TValues, TName>) => ReactElement;
}

export function FormField<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
>({
  name,
  label,
  labelAction,
  description,
  className,
  layout = "stacked",
  children,
}: FormFieldProps<TValues, TName>) {
  const { control, setValue, setError } = useFormContext<TValues>();
  const { errors } = useFormState({ control, name });
  const id = useId();
  return (
    <Controller
      key={name}
      control={control}
      name={name}
      render={({ field, fieldState: controllerState }) => {
        // Parent fields must also react to errors set on array items or nested paths.
        const error = get(errors, name) as FieldError | undefined;
        const fieldState = {
          ...controllerState,
          error,
          invalid: Boolean(error),
        };
        const itemErrors: Record<number, string> = {};
        for (const [index, itemError] of Object.entries(error ?? {})) {
          if (
            /^\d+$/.test(index) &&
            itemError &&
            typeof itemError === "object" &&
            "message" in itemError &&
            typeof itemError.message === "string"
          )
            itemErrors[Number(index)] = itemError.message;
        }
        const message =
          fieldState.error?.message ??
          fieldState.error?.root?.message ??
          (Object.values(itemErrors).join(" ") || undefined);
        const labelElement = label && (
          <Label
            id={`${id}-label`}
            htmlFor={id}
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white/85"
          >
            {label}
          </Label>
        );
        const input = children({
          field,
          fieldState,
          id,
          initialize: (value) =>
            setValue(name, value, {
              shouldValidate: false,
              shouldDirty: false,
              shouldTouch: false,
            }),
          onError: (message, errors) => {
            if (errors && Object.keys(errors).length) {
              for (const [path, error] of Object.entries(errors))
                setError(
                  path as Path<TValues>,
                  { type: "server", message: error },
                  { shouldFocus: true },
                );
            } else {
              setError(
                name,
                { type: "server", message },
                { shouldFocus: true },
              );
            }
          },
          itemErrors,
          controlProps: {
            id,
            "aria-invalid": fieldState.invalid,
            "aria-describedby":
              message || description ? `${id}-message` : undefined,
            "aria-labelledby": label ? `${id}-label` : undefined,
          },
        });
        return (
          <Field className={cn("w-full flex flex-col gap-2", className)}>
            {layout === "inline" ? (
              <div className="flex items-center gap-x-3">
                {input}
                {labelElement}
              </div>
            ) : (
              <>
                {labelAction ? (
                  <div className="flex items-center justify-between gap-2">
                    {labelElement}
                    {labelAction}
                  </div>
                ) : (
                  labelElement
                )}
                {input}
              </>
            )}
            {message ? (
              <Description
                as="p"
                id={`${id}-message`}
                className="text-sm text-red-500"
              >
                {message}
              </Description>
            ) : description ? (
              <Description
                as="p"
                id={`${id}-message`}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {description}
              </Description>
            ) : null}
          </Field>
        );
      }}
    />
  );
}

export function FormError({ className }: { className?: string }) {
  const { control } = useFormContext();
  const { errors } = useFormState({ control, name: "root" });
  return errors.root?.message ? (
    <p role="alert" className={cn("text-sm text-red-500", className)}>
      {errors.root.message}
    </p>
  ) : null;
}

export function LocalizedFormField<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
>({ lng, ...props }: FormFieldProps<TValues, TName> & { lng: string }) {
  const otherLanguage = lng === "sk" ? "en" : "sk";
  const segments = props.name.split(".");
  const localeIndex = segments.findIndex((segment) => segment === lng);
  if (localeIndex !== -1) segments[localeIndex] = otherLanguage;
  const otherName = segments.join(".") as TName;
  const { control } = useFormContext<TValues>();
  const { errors } = useFormState({ control, name: [props.name, otherName] });
  const hasError = Boolean(get(errors, props.name) || get(errors, otherName));
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => {
    if (!hasError) setExpanded(false);
  });
  return (
    <div
      ref={ref}
      onFocus={() => setExpanded(true)}
      onClick={() => setExpanded(true)}
    >
      <FormField {...props} />
      {(expanded || hasError) && otherName !== props.name && (
        <div className="mt-2">
          <FormField
            {...props}
            name={otherName}
            label={
              props.label
                ? `${props.label} ${lng === "sk" ? "anglicky" : "in Slovak"}`
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
