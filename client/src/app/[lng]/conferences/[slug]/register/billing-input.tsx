"use client";
import { useState, type AriaAttributes, type Ref } from "react";
import type {
  BillingInput,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
export default function ConferenceBillingInput({
  billings,
  value,
  onNameChange,
  onSelect,
  onClear,
  ref,
  ...props
}: AriaAttributes & {
  billings?: UserFragment["billings"];
  value?: BillingInput | null;
  onNameChange: (name: string) => void;
  onSelect: (billing: BillingInput) => void;
  onClear: () => void;
  id?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "common");
  const [query, setQuery] = useState("");
  const options = (billings ?? [])
    .filter((billing) => billing !== null)
    .filter((billing) =>
      billing.name
        .toLocaleLowerCase(lng)
        .includes(query.toLocaleLowerCase(lng)),
    );
  return (
    <Combobox<BillingInput>
      value={value ?? null}
      items={options}
      filter={null}
      inputValue={value?.name ?? ""}
      openOnInputClick
      itemToStringLabel={(billing) => billing.name}
      isItemEqualToValue={(a, b) =>
        a.name.toLocaleLowerCase(lng) === b.name.toLocaleLowerCase(lng)
      }
      onValueChange={(billing) => {
        if (billing) {
          onSelect(billing);
          setQuery("");
        }
      }}
      onInputValueChange={(text, details) => {
        if (
          details.reason === "input-change" ||
          details.reason === "input-clear"
        ) {
          setQuery(text);
          onNameChange(text);
        }
      }}
    >
      <div className="flex items-center gap-2">
        <ComboboxInput
          toggleLabel={t("showOptions")}
          {...props}
          ref={ref}
          className="min-h-10 w-full bg-background"
        />
        {value?.name && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("clear")}
            onClick={() => {
              setQuery("");
              onClear();
            }}
          >
            <Icon name="x-mark" className="size-4" />
          </Button>
        )}
      </div>
      <ComboboxContent>
        <ComboboxList>
          {options.map((billing, index) => (
            <ComboboxItem key={index} value={billing} className="min-h-10">
              {billing.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
        {!options.length && (
          <p className="p-3 text-sm text-muted-foreground">{t("notFound")}</p>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
