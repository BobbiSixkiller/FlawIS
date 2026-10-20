"use client";
import Icon from "@/components/icon";
import { cn } from "@/lib/utils";
import type { GqlMutationResponse } from "@/lib/graphql/actions";
import { useTranslation } from "@/lib/i18n/client";
import isEqual from "lodash/isEqual.js";
import {
  type AriaAttributes,
  type Ref,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import Spinner from "./spinner";
import { Button } from "@/components/ui/button";

export interface GenericComboboxProps<TOption, TValue> extends AriaAttributes {
  lng: string;
  name: string;
  value?: TValue | TValue[] | null;
  onChange: (value: TValue | TValue[]) => void;
  onBlur?: () => void;
  id?: string;
  ref?: Ref<HTMLInputElement>;
  onError?: (message: string, errors?: Record<string, string>) => void;
  itemErrors?: Record<number, string>;
  placeholder?: string;
  disabled?: boolean;
  defaultOptions: TOption[];
  multiple?: boolean;
  immediate?: boolean;
  displayValue?: (val: TOption) => string;
  fetchOptions?: (query: string) => Promise<TOption[]>;
  createOption?: (text: string) => Promise<GqlMutationResponse<TOption>>;
  renderOption: (
    option: TOption,
    props: { focus: boolean; selected: boolean },
  ) => React.ReactElement;
  getOptionLabel: (opt: TOption) => string;
  getOptionValue: (opt: TOption | null) => TValue;
  allowCreateNewOptions?: boolean;
  onFocus?: () => void;
  onClick?: () => void;
}

export default function GenericCombobox<
  TOption extends { id: string | number; val: any },
  TValue,
>({
  lng,
  name,
  value: fieldValue,
  onChange,
  onError,
  itemErrors,
  ref,
  placeholder,
  disabled,
  multiple = false,
  immediate = false,
  defaultOptions,
  displayValue,
  fetchOptions,
  createOption,
  renderOption,
  getOptionLabel,
  getOptionValue,
  allowCreateNewOptions,
  ...props
}: GenericComboboxProps<TOption, TValue>) {
  const { t } = useTranslation(lng, "common");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [remote, setRemote] = useState<{
    query: string;
    options: TOption[];
    loading: boolean;
    error: boolean;
  }>({ query: "", options: [], loading: false, error: false });
  const debounced = useDebouncedCallback(setQuery, 350);
  const selected = useMemo(() => {
    const values = multiple
      ? Array.isArray(fieldValue)
        ? fieldValue
        : []
      : fieldValue == null
        ? []
        : [fieldValue];
    return values.map((value, index) => {
      if (typeof value === "object" && value !== null && "id" in value)
        return value as TOption;
      return (
        defaultOptions.find((option) =>
          isEqual(getOptionValue(option), value),
        ) ?? ({ id: index, val: value } as TOption)
      );
    });
  }, [fieldValue, multiple, defaultOptions, getOptionValue]);
  useEffect(() => {
    if (!fetchOptions || !query) return;
    let active = true;
    fetchOptions(query)
      .then((options) => {
        if (active) setRemote({ query, options, loading: false, error: false });
      })
      .catch(() => {
        if (active)
          setRemote({ query, options: [], loading: false, error: true });
      });
    return () => {
      active = false;
    };
  }, [query, fetchOptions]);
  const options =
    fetchOptions && query
      ? remote.query === query
        ? remote.options
        : []
      : defaultOptions.filter((option) =>
          getOptionLabel(option)
            .toLocaleLowerCase(lng)
            .includes(text.toLocaleLowerCase(lng)),
        );
  const newOption = useMemo(
    () => ({ id: null, val: text }) as unknown as TOption,
    [text],
  );
  const items =
    allowCreateNewOptions && text.trim() ? [newOption, ...options] : options;
  const loading =
    creating || (Boolean(fetchOptions && query) && remote.query !== query);
  function clearQuery() {
    debounced.cancel();
    setText("");
    setQuery("");
  }
  async function handleChange(next: TOption | TOption[] | null) {
    const values = Array.isArray(next) ? next : next ? [next] : [];
    const last = values.at(-1);
    if (last && last.id == null && createOption) {
      setCreating(true);
      try {
        const result = await createOption(last.val);
        if (!result.success) {
          onError?.(result.message, result.errors);
          return;
        }
        if (!result.data) return;
        const resolved = [...values.slice(0, -1), result.data];
        onChange(
          multiple ? resolved.map(getOptionValue) : getOptionValue(result.data),
        );
      } catch {
        onError?.(t("requestFailed"));
      } finally {
        setCreating(false);
      }
    } else {
      onChange(
        multiple
          ? values.map(getOptionValue)
          : getOptionValue(values[0] ?? null),
      );
    }
    clearQuery();
  }
  return (
    <Combobox<TOption, boolean>
      multiple={multiple}
      value={multiple ? selected : (selected[0] ?? null)}
      onValueChange={(value, details) => {
        // Escape dismisses suggestions without discarding the form's selection.
        if (details.reason === "escape-key") {
          details.cancel();
          return;
        }
        void handleChange(value);
      }}
      disabled={disabled}
      items={items}
      filter={null}
      inputValue={multiple ? text : undefined}
      itemToStringLabel={(option) =>
        displayValue?.(option) ?? getOptionLabel(option)
      }
      isItemEqualToValue={(a, b) =>
        isEqual(getOptionValue(a), getOptionValue(b))
      }
      onInputValueChange={(value, details) => {
        if (
          details.reason !== "input-change" &&
          details.reason !== "input-clear"
        )
          return;
        setText(value);
        if (fetchOptions) debounced(value);
        else setQuery(value);
      }}
      openOnInputClick={immediate}
      onOpenChange={(open) => {
        if (!open) clearQuery();
      }}
    >
      <div className="space-y-2">
        {multiple && selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((option, index) => (
              <span
                key={index}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border bg-muted py-1 pl-2 text-sm",
                  itemErrors?.[index] && "border-destructive text-destructive",
                )}
              >
                {getOptionLabel(option)}
                <Button
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  aria-label={`${t("remove")}: ${getOptionLabel(option)}`}
                  onClick={() =>
                    onChange(
                      selected
                        .filter((_, i) => i !== index)
                        .map(getOptionValue),
                    )
                  }
                >
                  <Icon name="x-mark" className="size-3" />
                </Button>
              </span>
            ))}
          </div>
        )}
        <ComboboxInput
          toggleLabel={t("showOptions")}
          {...props}
          ref={ref}
          name={name}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-10 w-full bg-background"
          onKeyDown={(event) => {
            if (
              multiple &&
              event.key === "Backspace" &&
              !text &&
              Array.isArray(fieldValue)
            ) {
              event.preventDefault();
              onChange(fieldValue.slice(0, -1));
            }
          }}
        />
        <ComboboxContent>
          {loading && (
            <div role="status" className="flex items-center gap-2 p-3">
              <Spinner />
              <span className="sr-only">{t("loading")}</span>
            </div>
          )}
          {remote.error && remote.query === query && query && (
            <p role="alert" className="p-3 text-sm text-destructive">
              {t("requestFailed")}
            </p>
          )}
          <ComboboxList>
            {items.map((option, index) => (
              <ComboboxItem
                key={option.id ?? "create"}
                value={option}
                index={index}
                className="min-h-10"
                render={(itemProps, state) => (
                  <div {...itemProps}>
                    {option.id == null
                      ? t("addOption", { value: text })
                      : renderOption(option, {
                          focus: state.highlighted,
                          selected: state.selected,
                        })}
                  </div>
                )}
              />
            ))}
          </ComboboxList>
          {!items.length && !loading && (
            <p className="p-3 text-sm text-muted-foreground">{t("notFound")}</p>
          )}
        </ComboboxContent>
      </div>
    </Combobox>
  );
}
