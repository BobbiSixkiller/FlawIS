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

export function withLocalizedInput<TProps extends WithLocalizedInputProps>(
  InputComponent: ComponentType<TProps>
) {
  return function WithLocalizedInputWrapper(props: TProps) {
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
            <InputComponent
              {...props}
              error={localizedError}
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
  };
}
