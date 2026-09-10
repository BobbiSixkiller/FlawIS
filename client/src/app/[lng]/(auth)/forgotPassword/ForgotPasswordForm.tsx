"use client";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { sendResetLink } from "./actions";

export default function ForgotPasswordForm() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "forgotPassword");

  const { v } = useValidation();

  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    email: v.string().email(v.email).min(1, v.required),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer schema={schema} defaultValues={{ email: "" }}>
      {(methods) => (
        <form
          className="space-y-6 mt-4"
          onSubmit={methods.handleSubmit(async (val) => {
            const { message, success } = await sendResetLink(val.email);

            setMessage(message, success);
          })}
        >
          <FormField<FormValues, "email"> name="email" label={t("email")}>
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="off"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>

          <Button
            className="w-full"
            type="submit"
            size="sm"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <div className="flex gap-2 items-center">
                <Spinner inverted />
                {t("submitting")}
              </div>
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
