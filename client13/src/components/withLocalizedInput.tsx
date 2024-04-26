"use client";

import useOnClickOutside from "@/hooks/useOnClickOutside";
import { Transition } from "@headlessui/react";
import {
  ComponentType,
  Fragment,
  InputHTMLAttributes,
  useRef,
  useState,
} from "react";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  name: string;
  label: string;
}

export function withLocalizedInput(
  { lng, ...props }: { lng: string } & InputProps,
  InputComponent: ComponentType<InputProps>
) {
  return function WithLocalizedInputComponent() {
    const [visible, setVisible] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    useOnClickOutside(ref, () => setVisible(false));

    return (
      <div ref={ref}>
        <InputComponent {...props} onFocus={() => setVisible(true)} />
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
              label={
                lng === "sk"
                  ? `${props.label} anglicky`
                  : `${props.label} in Slovak`
              }
              name={props.name.replace(lng, lng === "sk" ? "en" : "sk")}
              onFocus={() => setVisible(true)}
            />
          </div>
        </Transition>
      </div>
    );
  };
}
