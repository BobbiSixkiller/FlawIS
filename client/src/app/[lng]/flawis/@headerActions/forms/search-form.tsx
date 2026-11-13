"use client";
import { useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SearchComponent from "@/components/search";
import type { FormLibraryQuery } from "@/lib/graphql/generated/graphql";
type Definition = FormLibraryQuery["formLibrary"][number];
function FormOption({ data }: { data: Definition; active: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span>
        {data.name} · v{data.latestVersion}
      </span>
      <span className="text-xs text-muted-foreground">{data.description}</span>
    </div>
  );
}
export default function SearchForm({ forms }: { forms: Definition[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const { lng } = useParams<{ lng: string }>();
  const searchForms = useCallback(
    async ({ text }: { text: string }) =>
      forms.filter((form) =>
        `${form.name} ${form.description || ""}`
          .toLocaleLowerCase(lng)
          .includes(text.toLocaleLowerCase(lng)),
      ),
    [forms, lng],
  );
  return (
    <SearchComponent
      placeholder={lng === "en" ? "Find a form" : "Hľadať formulár"}
      fetchOptions={searchForms}
      Option={FormOption}
      onOptionSelect={(form) => {
        const next = new URLSearchParams(params);
        next.set("form", form.id);
        router.push(`/forms?${next}`, { scroll: false });
      }}
    />
  );
}
