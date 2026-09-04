"use client";

import useOnClickOutside from "@/hooks/useOnClickOutside";
import { Transition } from "@headlessui/react";
import {
  ComponentType,
  Fragment,
  ReactElement,
  useRef,
  useState,
} from "react";
import { get } from "lodash";
import { InputProps } from "./Input";
import { useFormState } from "react-hook-form";

type WithLocalizedInputProps = {
  lng: string;
} & InputProps;

export function withLocalizedInput<T extends ComponentType<any>>(
  InputComponent: T,
) {
  type Props = React.ComponentProps<T> & WithLocalizedInputProps;

  function Wrapper(props: Props) {
    const { name, lng, label, ...rest } = props;
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const localizedInputName = name.replace(lng, lng === "sk" ? "en" : "sk");
    const { errors } = useFormState({
      control: props.control,
      name: [name, localizedInputName],
    });
    const error = get(errors, name)?.message?.toString();
    const localizedError = get(errors, localizedInputName)?.message?.toString();

    const showLocalizedInput = visible || Boolean(error || localizedError);

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
          onFocus={() => setVisible(true)}
          onClick={() => setVisible(true)}
        />
        <Transition as={Fragment} show={showLocalizedInput}>
          <div className="mt-2">
            <InputComponent
              {...(rest as any)}
              name={localizedInputName}
              lng={lng === "sk" ? "en" : "sk"}
              label={lng === "sk" ? `${label} anglicky` : `${label} in Slovak`}
              onFocus={() => setVisible(true)}
            />
          </div>
        </Transition>
      </div>
    );
  }

  // 🔑 Critical: Preserve generics from the wrapped component
  return Wrapper as unknown as (<U extends any[]>(...args: U) => ReactElement) &
    T;
}
