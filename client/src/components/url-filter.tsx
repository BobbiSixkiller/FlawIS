"use client";

import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Switch } from "@base-ui/react/switch";
import { overlayPosition, type OverlayAnchor } from "./overlay-position";
import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import Icon from "@/components/icon";
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
  anchor?: OverlayAnchor;
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
    <span className={cn("inline-flex shrink-0", wrapperClassName)}>
      <Popover>
        <PopoverTrigger
          render={<Button variant="ghost" size={buttonSize} />}
          aria-busy={pending}
          aria-label={`${label ?? t("urlFilter.label")}${activeCount ? ` ${activeCount}` : ""}`}
          className={cn(
            "cursor-pointer",
            "h-11 rounded-full border border-border bg-card px-3 text-foreground dark:border-border dark:bg-card dark:text-foreground",
            label && "px-4",
            activeCount > 0 &&
              "border-primary-200 bg-accent text-accent-foreground dark:border-primary-800 dark:bg-accent dark:text-accent-foreground",
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
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent
          {...overlayPosition(anchor ?? { to: "bottom end", gap: 8 })}
          role="dialog"
          aria-label={label ?? t("urlFilter.label")}
          className="z-30 max-h-[min(24rem,60vh)] w-80 max-w-[calc(100vw-3rem)] origin-top-right overflow-y-auto rounded-2xl border border-border bg-card p-3 text-sm text-foreground shadow-lg transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none dark:border-border dark:bg-card dark:text-foreground"
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
                    <p className="px-2 py-3 text-muted-foreground dark:text-muted-foreground">
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
                              "bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground",
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
          <div className="mt-3 flex justify-end border-t border-border pt-3 dark:border-border">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 rounded-full px-3 text-sm text-muted-foreground dark:text-muted-foreground"
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
        </PopoverContent>
        <span role="status" className="sr-only">
          {pending ? t("urlFilter.updating") : ""}
        </span>
      </Popover>
    </span>
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
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      className="group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-ring dark:hover:bg-card"
    >
      <span className="min-w-0 flex-1 break-words">{label}</span>
      {count !== undefined && (
        <span
          aria-hidden="true"
          className="text-xs tabular-nums text-muted-foreground dark:text-muted-foreground"
        >
          {count}
        </span>
      )}
      <span
        aria-hidden="true"
        className="flex h-6 w-10 shrink-0 items-center rounded-full bg-muted p-0.5 transition-colors group-data-checked:bg-primary motion-reduce:transition-none dark:bg-switch-track dark:group-data-checked:bg-primary"
      >
        <span className="size-5 rounded-full bg-card shadow-sm transition-transform group-data-checked:translate-x-4 motion-reduce:transition-none dark:bg-foreground dark:group-data-checked:bg-primary-foreground" />
      </span>
    </Switch.Root>
  );
}
