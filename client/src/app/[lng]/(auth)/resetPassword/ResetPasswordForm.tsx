"use client";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";
import { compareFields } from "@/lib/validation/form-validation";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { useMessageStore } from "@/stores/messageStore";
import { resetPassword } from "./actions";

export default function ResetPasswordForm({
  lng,
  token,
}: {
  lng: string;
  token?: string;
}) {
  const { t } = useTranslation(lng, "resetPassword");

  const { v } = useValidation();

  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = compareFields(
    z.object({
      password: v
        .string()
        .trim()
        .min(1, v.required)
        .refine(
          (value) => !value || /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/.test(value),
          t("password", { ns: "validation" }),
        ),
      confirmPass: v.string().trim().min(1, v.required),
    }),
    "confirmPass",
    "password",
    (value, other) => value == null || other == null || value === other,
    t("confirmPass", { ns: "validation" }),
  );
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      defaultValues={{ password: "", confirmPass: "" }}
      schema={schema}
    >
      {(methods) => (
        <form
          className="space-y-6 mt-4"
          onSubmit={methods.handleSubmit(
            async ({ password }) => {
              const res = await resetPassword({ password }, token || "");
              if (res) {
                setMessage(res.message, res.success);
              }
            },
            (err) => console.log(err),
          )}
        >
          <FormField<FormValues, "password">
            name="password"
            label={t("password")}
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="password"
                autoComplete="off"
                value={inputValue(field.value, "password")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "confirmPass">
            name="confirmPass"
            label={t("repeatPass")}
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="password"
                autoComplete="off"
                value={inputValue(field.value, "password")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>

          <Button
            className="w-full items-center justify-center gap-2"
            type="submit"
            size="sm"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <>
                <Spinner inverted />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
