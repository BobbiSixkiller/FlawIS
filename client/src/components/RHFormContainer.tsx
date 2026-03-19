"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { ReactNode } from "react";
import {
  DefaultValues,
  FieldErrors,
  FormProvider,
  Resolver,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { ObjectSchema } from "yup";

export default function RHFormContainer<TVals extends Record<string, any>>({
  errors,
  defaultValues,
  values,
  yupSchema,
  children,
  shouldUnregister,
}: {
  errors?: FieldErrors<TVals>;
  defaultValues?: DefaultValues<TVals>;
  values?: TVals;
  yupSchema: ObjectSchema<TVals>;
  children: (methods: UseFormReturn<TVals>) => ReactNode;
  shouldUnregister?: boolean;
}) {
  const methods = useForm<TVals>({
    errors,
    defaultValues,
    values,
    resolver: yupResolver(yupSchema) as unknown as Resolver<TVals>,
    shouldUnregister,
  });

  return <FormProvider {...methods}>{children(methods)}</FormProvider>;
}
