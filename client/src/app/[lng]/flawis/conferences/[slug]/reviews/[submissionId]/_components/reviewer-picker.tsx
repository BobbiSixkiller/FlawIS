"use client";
import { useEffect, useRef, useState } from "react";
import { getReviewerDirectory } from "@/lib/reviews/actions";
import type { ReviewerRecord } from "@/lib/reviews/types";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { errorText } from "@/lib/reviews/ux";
import { localizedText as tr } from "@/lib/i18n/text";
export default function ReviewerPicker({
  value,
  onChange,
  lng,
  includeArchived = false,
}: {
  value: string;
  onChange: (value: string) => void;
  lng: string;
  includeArchived?: boolean;
}) {
  const t = tr(lng);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<ReviewerRecord[]>([]);
  const [selected, setSelected] = useState<ReviewerRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  useEffect(() => {
    const request = ++sequence.current;
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      getReviewerDirectory(
        search,
        undefined,
        includeArchived ? undefined : false,
      )
        .then((page) => {
          if (!cancelled && sequence.current === request) setOptions(page.rows);
        })
        .catch((e) => {
          if (!cancelled && sequence.current === request)
            setError(errorText(e, lng));
        })
        .finally(() => {
          if (!cancelled && sequence.current === request) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, [search, includeArchived, lng]);
  return (
    <Field>
      <FieldLabel htmlFor="reviewer-picker">
        {t("Recenzent", "Reviewer")}
      </FieldLabel>
      <Combobox
        items={options}
        value={value ? options.find((r) => r.id === value) || selected : null}
        itemToStringLabel={(r: ReviewerRecord) => r.name}
        itemToStringValue={(r: ReviewerRecord) => r.id}
        filter={null}
        onInputValueChange={setSearch}
        onValueChange={(r) => {
          setSelected(r);
          onChange(r?.id || "");
        }}
      >
        <ComboboxInput
          id="reviewer-picker"
          placeholder={t(
            "Meno, pracovisko alebo odbornosť…",
            "Name, affiliation or expertise…",
          )}
          toggleLabel={t("Zobraziť recenzentov", "Show reviewers")}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {loading
              ? t("Hľadá sa…", "Searching…")
              : t("Žiadni recenzenti", "No reviewers found")}
          </ComboboxEmpty>
          <ComboboxList>
            {(r: ReviewerRecord) => (
              <ComboboxItem key={r.id} value={r}>
                <div>
                  <p>{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.institution} · {r.email}
                  </p>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {error && <FieldDescription role="alert">{error}</FieldDescription>}
    </Field>
  );
}
