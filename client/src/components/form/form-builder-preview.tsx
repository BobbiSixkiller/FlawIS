"use client";

import { generateHTML, generateJSON } from "@tiptap/core";
import { useMemo } from "react";
import type { FormFieldInput } from "@/lib/graphql/generated/graphql";
import useLocalizedExtensions from "../../hooks/use-localized-extensions";
import { AnswerFields } from "./answer-fields";

/** Parses draft help through the editor's supported nodes before rendering HTML. */
export default function FormBuilderPreview({
  fields,
  ...props
}: {
  fields: FormFieldInput[];
  lng: string;
  values: Record<string, string | string[]>;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const { defaultExtensions } = useLocalizedExtensions();
  const previewFields = useMemo(
    () =>
      fields.map((f) => ({
        ...f,
        id: f.id!,
        helpText: f.helpText
          ? generateHTML(
              generateJSON(f.helpText, defaultExtensions),
              defaultExtensions,
            )
          : null,
        placeholder: f.placeholder ?? null,
        selectOptions: f.selectOptions ?? null,
        minFiles: f.minFiles ?? null,
        maxFiles: f.maxFiles ?? null,
      })),
    [fields, defaultExtensions],
  );
  return <AnswerFields {...props} fields={previewFields} preview />;
}
