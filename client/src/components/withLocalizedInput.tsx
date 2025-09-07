"use client";

import useOnClickOutside from "@/hooks/useOnClickOutside";
import { Transition } from "@headlessui/react";
import { ComponentType, Fragment, useEffect, useRef, useState } from "react";
import { get } from "lodash";
import { RHFmethodsProps } from "./Input";
import { Control } from "react-hook-form";

type WithLocalizedInputProps = {
  name: string;
  lng: string;
  disabled?: boolean;
  errors?: Record<string, any>;
  error?: string;
  label?: string;
  placeholder?: string;
  methods?: RHFmethodsProps;
  control?: Control<any>;
};

export function withLocalizedInput<
  // Extra generic params (e.g., TOption, TValue)
  // Defaulting to unknown so it works for Input/Textarea too
  T1 = unknown,
  T2 = unknown,
  // Props must at least include your localization props
  P extends WithLocalizedInputProps = WithLocalizedInputProps
>(InputComponent: ComponentType<P>) {
  // Preserve generics in the return type
  function WithLocalizedInputWrapper(props: P) {
    const [visible, setVisible] = useState(false);

    const localizedInputName = props.name.replace(
      props.lng,
      props.lng === "sk" ? "en" : "sk"
    );
    const localizedError = get(props.errors, localizedInputName)?.message;

    useEffect(() => {
      if (props.error || localizedError) {
        setVisible(true);
      }
    }, [props.error, localizedError]);

    const ref = useRef<HTMLDivElement>(null);
    useOnClickOutside(ref, () => {
      if (!props.error && !localizedError) {
        setVisible(false);
      }
    });

    return (
      <div ref={ref}>
        <InputComponent
          {...props}
          onFocus={() => setVisible(true)}
          onClick={() => setVisible(true)}
        />
        <Transition as={Fragment} show={visible}>
          <div className="mt-2">
            <InputComponent
              {...props}
              error={localizedError as any}
              label={
                props.lng === "sk"
                  ? `${props.label} anglicky`
                  : `${props.label} in Slovak`
              }
              name={localizedInputName}
              onFocus={() => setVisible(true)}
            />
          </div>
        </Transition>
      </div>
    );
  }

  // 👇 The important part:
  // return type is still generic in <T1, T2>
  return WithLocalizedInputWrapper as unknown as <A = T1, B = T2>(
    props: P
  ) => JSX.Element;
}
