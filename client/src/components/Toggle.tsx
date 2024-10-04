"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";

export default function Toggle({
  label,
  name,
  defaultChecked,
  handleToggle,
}: {
  label?: string;
  name?: string;
  defaultChecked: boolean;
  handleToggle: () => void;
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <Switch.Group as="div" className="flex gap-2 items-center">
      {label && <Switch.Label>{label}</Switch.Label>}
      <Switch
        name={name}
        checked={enabled}
        onChange={(checked) => {
          handleToggle();
          setEnabled(checked);
        }}
        className={`${enabled ? "bg-primary-700" : "bg-primary-400"}
      relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-primary-500`}
      >
        <span className="sr-only">Use toggle</span>
        <span
          aria-hidden="true"
          className={`${
            enabled ? "translate-x-9" : "translate-x-0"
          } pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </Switch.Group>
  );
}
