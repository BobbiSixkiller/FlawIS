"use client";
import { type ReactNode, useId, useState } from "react";
import { Switch } from "./ui/switch";
export default function Toggle({
  label,
  name,
  defaultChecked,
  handleToggle,
  icon,
  size = "regular",
  disabled = false,
}: {
  label?: string;
  name?: string;
  defaultChecked: boolean;
  handleToggle: () => void;
  icon?: ReactNode;
  size?: "regular" | "small";
  disabled?: boolean;
}) {
  const id = useId();
  const [enabled, setEnabled] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium"
      >
        {icon}
        {label}
      </label>
      <Switch
        id={id}
        name={name}
        checked={enabled}
        disabled={disabled}
        size={size === "small" ? "sm" : "default"}
        aria-label={label ?? name ?? "Toggle"}
        onCheckedChange={(checked) => {
          setEnabled(checked);
          handleToggle();
        }}
      />
    </div>
  );
}
