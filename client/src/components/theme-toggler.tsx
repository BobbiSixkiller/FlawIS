"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import Icon, { type IconName } from "@/components/icon";
import {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utilsClient";
import { useTranslation } from "@/lib/i18n/client";
import { ThemePreference } from "@/lib/theme";

import { useThemePreference } from "./theme-provider";

const options = [
  { value: "light", icon: "sun" },
  { value: "system", icon: "computer-desktop" },
  { value: "dark", icon: "moon" },
] as const satisfies readonly { value: ThemePreference; icon: IconName }[];

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
          ? "w-27 bg-card/95 shadow-sm ring-black/10 dark:bg-card/95 dark:ring-white/10"
          : "w-9 bg-transparent hover:bg-muted dark:hover:bg-card/15",
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
          "text-foreground transition-opacity duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          "dark:text-foreground dark:focus-visible:ring-ring motion-reduce:transition-none",
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
        <Icon
          name={selectedOption.icon}
          className="size-5"
          aria-hidden="true"
        />
      </button>

      <RadioGroup
        value={preference}
        onValueChange={(nextPreference) =>
          setPreference(nextPreference as ThemePreference)
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
        {options.map(({ value, icon }) => (
          <Radio.Root
            ref={value === preference ? selectedRadioRef : undefined}
            key={value}
            value={value}
            title={t(`theme.${value}`)}
            className={cn(
              "group flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground",
              "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              "data-checked:bg-primary data-checked:text-primary-foreground",
              "dark:text-muted-foreground dark:hover:bg-card/10 dark:hover:text-white",
              "dark:data-checked:bg-primary dark:data-checked:text-primary-foreground dark:focus-visible:ring-ring",
              "motion-reduce:transition-none",
            )}
            onClick={() => {
              if (collapseAfterSelectionRef.current) {
                collapseAfterSelectionRef.current = false;
                collapse({ restoreFocus: true });
              }
            }}
          >
            <Icon name={icon} className="size-5" aria-hidden="true" />
            <span className="sr-only">{t(`theme.${value}`)}</span>
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  );
}
