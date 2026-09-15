"use client";

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Switch,
  type PopoverPanelProps,
} from "@headlessui/react";
import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button, { type ButtonProps } from "@/components/Button";
import Icon from "@/components/Icon";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utilsClient";

export type UrlFilterConfig = {
  label: string;
  queryKey: string;
  type: "boolean" | "multi" | "single";
  options?: { value: string; label: string; count?: number }[];
};

export default function UrlFilter({
  filters,
  lng,
  label,
  anchor,
  className,
  wrapperClassName,
  buttonSize = "sm",
}: {
  filters: UrlFilterConfig[];
  lng: string;
  label?: string;
  anchor?: PopoverPanelProps["anchor"];
  className?: string;
  wrapperClassName?: string;
  buttonSize?: ButtonProps["size"];
}) {
  const { t } = useTranslation(lng, "common");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(
    searchParams.toString(),
  );
  const params = new URLSearchParams(optimisticQuery);
  const activeCount = filters.reduce((count, filter) => {
    if (filter.type === "boolean")
      return count + Number(params.get(filter.queryKey) === "true");
    if (filter.type === "single")
      return count + Number(Boolean(params.get(filter.queryKey)));
    return count + new Set(params.getAll(filter.queryKey).filter(Boolean)).size;
  }, 0);
  const hasFilters = filters.some((filter) => params.has(filter.queryKey));

  function updateParams(modifier: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(optimisticQuery);
    modifier(next);
    const query = next.toString();
    startTransition(() => {
      setOptimisticQuery(query);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function toggle(filter: UrlFilterConfig, value = "true") {
    updateParams((next) => {
      const current = [
        ...new Set(next.getAll(filter.queryKey).filter(Boolean)),
      ];
      next.delete(filter.queryKey);
      if (filter.type === "multi") {
        const values = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        values.forEach((item) => next.append(filter.queryKey, item));
      } else if (current[0] !== value) {
        next.set(filter.queryKey, value);
      }
    });
  }

  return (
    <Popover className={cn("inline-flex shrink-0", wrapperClassName)}>
      <PopoverButton
        as={Button}
        variant="ghost"
        size={buttonSize}
        aria-busy={pending}
        className={cn(
          "cursor-pointer",
          "h-11 rounded-full border border-gray-200 bg-white px-3 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white/85",
          label && "px-4",
          activeCount > 0 &&
            "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-200",
          className,
        )}
      >
        <Icon
          name={pending ? "spinner" : "funnel"}
          className={cn(
            "size-4",
            pending && "animate-spin motion-reduce:animate-none",
          )}
        />
        <span className={label ? undefined : "sr-only"}>
          {label ?? t("urlFilter.label")}
        </span>
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white dark:bg-primary-300 dark:text-gray-950">
            {activeCount}
          </span>
        )}
      </PopoverButton>
      <PopoverPanel
        focus
        transition
        anchor={anchor ?? { to: "bottom end", gap: 8, padding: 24 }}
        role="dialog"
        aria-label={label ?? t("urlFilter.label")}
        className="z-30 max-h-[min(24rem,60vh)] w-80 max-w-[calc(100vw-3rem)] origin-top-right overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-lg transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/85"
      >
        <div className="space-y-3">
          {filters.map((filter) =>
            filter.type === "boolean" ? (
              <FilterSwitch
                key={filter.queryKey}
                label={filter.label}
                checked={params.get(filter.queryKey) === "true"}
                onChange={() => toggle(filter)}
              />
            ) : (
              <fieldset key={filter.queryKey}>
                <legend className="mb-2 px-2 font-semibold">
                  {filter.label}
                </legend>
                {!filter.options?.length ? (
                  <p className="px-2 py-3 text-gray-500 dark:text-gray-400">
                    {t("urlFilter.empty")}
                  </p>
                ) : (
                  filter.options.map((option) =>
                    filter.type === "multi" ? (
                      <FilterSwitch
                        key={option.value}
                        label={option.label}
                        count={option.count}
                        checked={params
                          .getAll(filter.queryKey)
                          .includes(option.value)}
                        onChange={() => toggle(filter, option.value)}
                      />
                    ) : (
                      <Button
                        key={option.value}
                        variant="ghost"
                        aria-pressed={
                          params.get(filter.queryKey) === option.value
                        }
                        onClick={() => toggle(filter, option.value)}
                        className={cn(
                          "min-h-11 h-auto w-full justify-start whitespace-normal rounded-xl px-2 py-2 text-left",
                          params.get(filter.queryKey) === option.value &&
                            "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-200",
                        )}
                      >
                        {option.label}
                      </Button>
                    ),
                  )
                )}
              </fieldset>
            ),
          )}
        </div>
        <div className="mt-3 flex justify-end border-t border-gray-200 pt-3 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="h-11 rounded-full px-3 text-sm text-gray-600 dark:text-gray-300"
            disabled={!hasFilters}
            onClick={() =>
              updateParams((next) =>
                filters.forEach((filter) => next.delete(filter.queryKey)),
              )
            }
          >
            {t("urlFilter.clear")}
          </Button>
        </div>
      </PopoverPanel>
      <span role="status" className="sr-only">
        {pending ? t("urlFilter.updating") : ""}
      </span>
    </Popover>
  );
}

function FilterSwitch({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      className="group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:hover:bg-gray-800"
    >
      <span className="min-w-0 flex-1 break-words">{label}</span>
      {count !== undefined && (
        <span
          aria-hidden="true"
          className="text-xs tabular-nums text-gray-500 dark:text-gray-400"
        >
          {count}
        </span>
      )}
      <span
        aria-hidden="true"
        className="flex h-6 w-10 shrink-0 items-center rounded-full bg-gray-300 p-0.5 transition-colors group-data-checked:bg-primary-600 motion-reduce:transition-none dark:bg-gray-600 dark:group-data-checked:bg-primary-400"
      >
        <span className="size-5 rounded-full bg-white shadow-sm transition-transform group-data-checked:translate-x-4 motion-reduce:transition-none" />
      </span>
    </Switch>
  );
}
