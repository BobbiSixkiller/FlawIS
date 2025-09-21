"use client";

import { useTranslation } from "@/lib/i18n/client";
import { Trans } from "../../../../../node_modules/react-i18next";
import Link from "next/link";
import { login } from "./actions";

import { Input } from "@/components/Input";
import useValidation from "@/hooks/useValidation";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { cn } from "@/utils/helpers";
import { useMessageStore } from "@/stores/messageStore";
import RHFormContainer from "@/components/RHFormContainer";

export default function LoginForm({ lng, url }: { lng: string; url?: string }) {
  const { t } = useTranslation(lng, "login");

  const { yup } = useValidation();

  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <RHFormContainer
      defaultValues={{ email: "", password: "" }}
      yupSchema={yup.object({
        email: yup.string().email().required(),
        password: yup.string().required(),
      })}
    >
      {(methods) => (
        <form
          className="space-y-6"
          onSubmit={methods.handleSubmit(async (vals) => {
            const res = await login(vals.email, vals.password, url);
            if (res) {
              setMessage(res.message, res.success);
            }
          })}
        >
          <Input name="email" label="Email" autoComplete="email" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white/85"
              >
                {t("password")}
              </label>
              <Trans
                i18nKey={"forgot"}
                t={t}
                components={[
                  <Link
                    href="/forgotPassword"
                    className={cn([
                      "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                      "dark:text-primary-300 dark:hover:text-primary-300/90 dark:focus:ring-primary-300 dark:focus:ring-offset-gray-950",
                    ])}
                    key={0}
                  />,
                ]}
              />
            </div>

            <Input
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </div>

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
    </RHFormContainer>
  );
}
