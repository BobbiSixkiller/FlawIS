"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Children, cloneElement, isValidElement, ReactNode } from "react";
import {
  DefaultValues,
  FieldErrors,
  Resolver,
  useForm,
  UseFormReturn,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { ObjectSchema } from "yup";
import lodash from "lodash";

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

  const { register, formState, setFocus, setValue, watch } = methods;

  return (
    <div>
      {enhanceChildren(
        children(methods),
        register,
        formState.errors,
        setFocus,
        setValue,
        watch
      )}
    </div>
  );
}

function enhanceChildren(
  children: ReactNode,
  register: any,
  errors: any,
  setFocus: UseFormSetFocus<any>,
  setValue: UseFormSetValue<any>,
  watch: UseFormWatch<any>
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    const name = child.props.name;
    const error = name ? lodash.get(errors, name)?.message : undefined;

    const isUncontrolled = name && !child.props.control;

    const newProps: Record<string, any> = {
      ...child.props,
      ...(name && { error, errors }),
      ...(isUncontrolled && {
        methods: { register, setFocus, setValue, watch },
      }), // if the component is uncontrolled add RHF methods and errors
    };

    if (child.props.children) {
      newProps.children = enhanceChildren(
        child.props.children,
        register,
        errors,
        setFocus,
        setValue,
        watch
      );
    }

    return cloneElement(child, newProps);
  });
}
