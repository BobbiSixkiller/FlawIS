"use client";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import { useTranslation } from "@/lib/i18n/client";
import Link from "next/link";
import { Trans } from "react-i18next";
import { login } from "./actions";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { cn } from "@/lib/utilsClient";
import { useMessageStore } from "@/stores/messageStore";

export default function LoginForm({ lng, url }: { lng: string; url?: string }) {
  const { t } = useTranslation(lng, "login");

  const { v } = useValidation();

  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    email: v.string().email(v.email).min(1, v.required),
    password: v.string().min(1, v.required),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer defaultValues={{ email: "", password: "" }} schema={schema}>
      {(methods) => (
        <form
          className="space-y-6"
          onSubmit={methods.handleSubmit(async (vals) => {
            const res = await login(vals.email, vals.password, url);
            if (res) {
              setMessage(res.message, res.success);
            }

            if (res.success) {
              return setTimeout(
                () => window.location.replace(url ? url : "/"),
                300,
              );
            }
          })}
        >
          <FormField<FormValues, "email"> name="email" label="Email">
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="email"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>

          <FormField<FormValues, "password">
            name="password"
            label={t("password")}
            labelAction={
              <Trans
                i18nKey={"forgot"}
                t={t}
                components={[
                  <Link
                    href="/forgotPassword"
                    className={cn([
                      "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                      "dark:text-primary-300 dark:hover:text-primary-300/90 dark:focus:ring-primary-300 dark:focus:ring-offset-gray-950",
                    ])}
                    key={0}
                  />,
                ]}
              />
            }
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="password"
                autoComplete="current-password"
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
