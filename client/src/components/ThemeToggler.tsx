"use client";

import { Radio, RadioGroup } from "@headlessui/react";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/clientUtils";
import { useTranslation } from "@/lib/i18n/client";
import { ThemePreference } from "@/lib/theme";

import { useThemePreference } from "./ThemeProvider";

const options = [
  { value: "light", Icon: SunIcon },
  { value: "system", Icon: ComputerDesktopIcon },
  { value: "dark", Icon: MoonIcon },
] as const;

export default function ThemeToggler({
  lng,
  className,
}: {
  lng: string;
  className?: string;
}) {
  const { t } = useTranslation(lng, "dashboard");
  const { pending, preference, setPreference } = useThemePreference();
  const [expanded, setExpandedState] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedRadioRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(false);
  const collapseAfterSelectionRef = useRef(false);
  const suppressTriggerFocusRef = useRef(false);

  const selectedOption = options.find((option) => option.value === preference)!;
  const SelectedIcon = selectedOption.Icon;

  function setExpanded(nextExpanded: boolean) {
    expandedRef.current = nextExpanded;
    setExpandedState(nextExpanded);
  }

  function expandAndFocus() {
    if (expandedRef.current) return;

    setExpanded(true);
    requestAnimationFrame(() => selectedRadioRef.current?.focus());
  }

  function collapse({ restoreFocus = false } = {}) {
    if (!expandedRef.current) return;

    setExpanded(false);

    if (restoreFocus) {
      suppressTriggerFocusRef.current = true;
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  useEffect(() => {
    if (!expanded) return;

    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        expandedRef.current = false;
        setExpandedState(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [expanded]);

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") setExpanded(true);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType === "mouse" &&
      !rootRef.current?.contains(document.activeElement)
    ) {
      collapse();
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) collapse();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    collapseAfterSelectionRef.current = false;

    if (event.key === "Escape") {
      event.preventDefault();
      collapse({ restoreFocus: true });
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-9 shrink-0 overflow-hidden rounded-full align-middle",
        "ring-1 ring-transparent transition-[width,background-color,box-shadow] duration-200 ease-out",
        "motion-reduce:transition-none",
        expanded
          ? "w-27 bg-white/95 shadow-sm ring-black/10 dark:bg-gray-800/95 dark:ring-white/10"
          : "w-9 bg-transparent hover:bg-black/10 dark:hover:bg-white/15",
        pending && "opacity-70",
        className,
      )}
      aria-busy={pending}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={expanded}
        aria-label={`${t("theme.label")}: ${t(`theme.${preference}`)}`}
        tabIndex={expanded ? -1 : 0}
        className={cn(
          "absolute inset-0 z-10 flex size-9 items-center justify-center rounded-full",
          "text-gray-900 transition-opacity duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset",
          "dark:text-white/85 dark:focus-visible:ring-primary-300 motion-reduce:transition-none",
          expanded ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        onFocus={() => {
          if (suppressTriggerFocusRef.current) {
            suppressTriggerFocusRef.current = false;
            return;
          }

          expandAndFocus();
        }}
        onClick={expandAndFocus}
      >
        <SelectedIcon className="size-5" aria-hidden="true" />
      </button>

      <RadioGroup
        value={preference}
        onChange={(nextPreference: ThemePreference) =>
          setPreference(nextPreference)
        }
        inert={!expanded}
        aria-label={t("theme.label")}
        aria-hidden={!expanded}
        className={cn(
          "absolute inset-0 flex transition-[opacity,transform] duration-200 ease-out",
          "motion-reduce:transition-none",
          expanded
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-2 opacity-0",
        )}
        onPointerDown={(event) => {
          collapseAfterSelectionRef.current = event.pointerType !== "mouse";
        }}
      >
        {options.map(({ value, Icon }) => (
          <Radio
            ref={value === preference ? selectedRadioRef : undefined}
            key={value}
            value={value}
            title={t(`theme.${value}`)}
            className={cn(
              "group flex size-9 shrink-0 cursor-pointer items-center justify-center border-l border-black/10 text-gray-700 first:border-l-0",
              "transition-colors duration-150 hover:bg-primary-50 hover:text-primary-700 focus:outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
              "data-checked:bg-primary-500 data-checked:text-white",
              "dark:border-white/10 dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white",
              "dark:data-checked:bg-primary-300 dark:data-checked:text-gray-950 dark:focus-visible:ring-primary-300",
              "motion-reduce:transition-none",
            )}
            onClick={() => {
              if (collapseAfterSelectionRef.current) {
                collapseAfterSelectionRef.current = false;
                collapse({ restoreFocus: true });
              }
            }}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="sr-only">{t(`theme.${value}`)}</span>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
