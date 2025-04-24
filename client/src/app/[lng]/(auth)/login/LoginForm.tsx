"use client";

import { useTranslation } from "@/lib/i18n/client";
import { Trans } from "../../../../../node_modules/react-i18next";
import Link from "next/link";
import { useContext, useState } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { login } from "./actions";
import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/Input";
import useValidation from "@/hooks/useValidation";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { cn } from "@/utils/helpers";

export default function LoginForm({ lng, url }: { lng: string; url?: string }) {
  const { t } = useTranslation(lng, "login");

  const { dispatch } = useContext(MessageContext);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        email: yup.string().email().required(),
        password: yup.string().required(),
      })
    ),
    defaultValues: { email: "", password: "" },
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={methods.handleSubmit(
          async (val) => {
            const state = await login(val.email, val.password, url);
            if (state && !state.success) {
              dispatch({
                type: ActionTypes.SetFormMsg,
                payload: { message: state.message, success: state.success },
              });
            }
          },
          (errs) => console.log(errs)
        )}
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
                    "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                    "dark:text-primary-300 dark:hover:text-primary-300/90",
                  ])}
                  key={0}
                />,
              ]}
            />
          </div>

          <Input
            name="password"
            type="password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
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
    </FormProvider>
  );
}
