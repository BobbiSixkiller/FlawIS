"use client";
import { type ComponentType, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import { Button } from "@/components/ui/button";
import Icon from "./icon";
import Spinner from "./spinner";
interface SearchComponentProps<TOption, TParams> {
  fetchOptions: (params: TParams) => Promise<TOption[]>;
  onOptionSelect: (option: TOption) => void;
  Option: ComponentType<{ data: TOption; active: boolean }>;
  placeholder?: string;
}
export default function SearchComponent<
  TOption extends { id: string },
  TParams extends { text: string },
>({
  fetchOptions,
  Option,
  onOptionSelect,
  placeholder,
}: SearchComponentProps<TOption, TParams>) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "common");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [query] = useDebounce(text, 350);
  const [result, setResult] = useState<{
    query: string;
    options: TOption[];
    error: boolean;
  }>({ query: "", options: [], error: false });
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    if (!open || !query.trim()) return;
    let active = true;
    fetchOptions({ text: query } as TParams)
      .then((options) => {
        if (active) setResult({ query, options, error: false });
      })
      .catch(() => {
        if (active) setResult({ query, options: [], error: true });
      });
    return () => {
      active = false;
    };
  }, [query, open, fetchOptions]);
  const loading =
    Boolean(text.trim()) && (query !== text || result.query !== query);
  const options = !loading && text.trim() ? result.options : [];
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setText("");
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="icon"
            variant="outline"
            aria-label={placeholder ?? t("search")}
          />
        }
      >
        <Icon name="magnifying-glass" className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogTitle>{placeholder ?? t("search")}</DialogTitle>
        <Combobox<TOption>
          items={options}
          filter={null}
          open
          value={null}
          inputValue={text}
          onInputValueChange={setText}
          onValueChange={(option) => {
            if (option) {
              onOptionSelect(option);
              setOpen(false);
              setText("");
            }
          }}
        >
          <ComboboxInput
            autoComplete="off"
            autoFocus
            showTrigger={false}
            aria-label={placeholder ?? t("search")}
            placeholder={placeholder}
            className="h-11"
          />
          {loading && text && (
            <div role="status" className="p-3">
              <Spinner />
            </div>
          )}
          <ComboboxList className="max-h-80">
            {options.map((option) => (
              <ComboboxItem
                key={option.id}
                value={option}
                render={(props, state) => (
                  <div {...props}>
                    <Option data={option} active={state.highlighted} />
                  </div>
                )}
              />
            ))}
          </ComboboxList>
          {text && !loading && !options.length && (
            <p role="status" className="p-3 text-sm text-muted-foreground">
              {t(result.error ? "requestFailed" : "notFound")}
            </p>
          )}
        </Combobox>
      </DialogContent>
    </Dialog>
  );
}
