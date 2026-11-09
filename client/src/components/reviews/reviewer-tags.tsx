"use client";
import GenericCombobox from "../generic-combobox";
import { ReviewField } from "../review-controls";

/** Reuse the shared multi-select while allowing conference-specific vocabulary. */
export default function ReviewerTags({
  name,
  label,
  value,
  suggestions = [],
  onChange,
  lng,
}: {
  name: string;
  label: string;
  value: string[];
  suggestions?: string[];
  onChange: (value: string[]) => void;
  lng: string;
}) {
  const options = [...new Set([...suggestions, ...value])].map((val) => ({
    id: val,
    val,
  }));
  return (
    <ReviewField label={label}>
      {(id) => (
        <GenericCombobox
          id={id}
          lng={lng}
          name={name}
          multiple={true}
          immediate
          value={value}
          defaultOptions={options}
          getOptionLabel={(option) => option.val}
          getOptionValue={(option) => option?.val || ""}
          renderOption={(option) => <span>{option.val}</span>}
          allowCreateNewOptions
          createOption={async (text) => ({
            success: true,
            message: "",
            data: { id: text.trim(), val: text.trim() },
          })}
          onChange={(next) =>
            onChange([
              ...new Set((Array.isArray(next) ? next : [next]).filter(Boolean)),
            ])
          }
        />
      )}
    </ReviewField>
  );
}
