import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FormProvider,
  useForm,
  type FieldErrors,
} from "react-hook-form";

import { LocalizedTextarea } from "../src/components/Textarea";
import { type InputProps } from "../src/components/Input";

type FormValues = {
  submission: {
    translations: {
      sk: { name: string };
      en: { name: string };
    };
  };
};

function TestForm({ errors }: { errors?: FieldErrors<FormValues> }) {
  const methods = useForm<FormValues>({
    defaultValues: {
      submission: {
        translations: {
          sk: { name: "Slovenský názov" },
          en: { name: "English title" },
        },
      },
    },
    errors,
  });

  const LocalizedTextareaForTest = LocalizedTextarea as ComponentType<
    InputProps & { lng: string }
  >;
  const TestFormProvider = FormProvider<FormValues> as unknown as ComponentType<
    typeof methods
  >;

  return createElement(
    TestFormProvider,
    methods,
    createElement(LocalizedTextareaForTest, {
      lng: "sk",
      label: "Názov",
      name: "submission.translations.sk.name",
    }),
  );
}

test("a translated-field error reveals the localized input and its message", () => {
  const html = renderToStaticMarkup(
    createElement(TestForm, {
      errors: {
        submission: {
          translations: {
            en: {
              name: {
                type: "server",
                message:
                  "An English submission with this title already exists",
              },
            },
          },
        },
      },
    }),
  );

  assert.equal(html.match(/<textarea/g)?.length, 2);
  assert.match(
    html,
    /An English submission with this title already exists/,
  );
});

test("the localized input stays collapsed when neither translation has an error", () => {
  const html = renderToStaticMarkup(createElement(TestForm));

  assert.equal(html.match(/<textarea/g)?.length, 1);
});
