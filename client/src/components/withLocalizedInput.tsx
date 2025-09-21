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

export function withLocalizedInput<T extends ComponentType<any>>(
  InputComponent: T
) {
  type Props = React.ComponentProps<T> & WithLocalizedInputProps;

  function Wrapper(props: Props) {
    const { name, lng, errors, error, label, ...rest } = props;
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const localizedInputName = name.replace(lng, lng === "sk" ? "en" : "sk");
    const localizedError = get(errors, localizedInputName)?.message;

    useEffect(() => {
      if (error || localizedError) setVisible(true);
    }, [error, localizedError]);

    useOnClickOutside(ref, () => {
      if (!error && !localizedError) setVisible(false);
    });

    return (
      <div ref={ref}>
        <InputComponent
          {...(rest as any)}
          name={name}
          lng={lng}
          label={label}
          error={error}
          onFocus={() => setVisible(true)}
          onClick={() => setVisible(true)}
        />
        <Transition as={Fragment} show={visible}>
          <div className="mt-2">
            <InputComponent
              {...(rest as any)}
              name={localizedInputName}
              lng={lng === "sk" ? "en" : "sk"}
              label={lng === "sk" ? `${label} anglicky` : `${label} in Slovak`}
              error={localizedError}
              onFocus={() => setVisible(true)}
            />
          </div>
        </Transition>
      </div>
    );
  }

  // 🔑 Critical: Preserve generics from the wrapped component
  return Wrapper as unknown as (<U extends any[]>(...args: U) => JSX.Element) &
    T;
}
