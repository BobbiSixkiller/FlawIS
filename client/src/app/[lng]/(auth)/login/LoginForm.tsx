"use client";

import { useTranslation } from "@/lib/i18n/client";
import { Trans } from "../../../../../node_modules/react-i18next";
import Link from "next/link";
import Button from "@/components/Button";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { login } from "./actions";
import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/Input";
import useValidation from "@/hooks/useValidation";

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

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 mt-4"
        onSubmit={methods.handleSubmit(
          async (val) => {
            const state = await login(val.email, val.password, url);
            if (state && !state.success) {
              dispatch({
                type: ActionTypes.SetFormMsg,
                payload: state,
              });
            }
          },
          (errs) => console.log(errs)
        )}
      >
        <Input name="email" label="Email" />
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {t("password")}
            </label>
            <Trans
              i18nKey={"forgot"}
              t={t}
              components={[
                <Link
                  href="/forgotPassword"
                  className="text-sm font-semibold text-primary-500 hover:text-primary-700 focus:outline-primary-500"
                  key={0}
                />,
              ]}
            />
          </div>
          <Input name="password" type="password" />
        </div>
        <Button
          color="primary"
          type="submit"
          fluid
          loadingText={t("submitting")}
          disabled={methods.formState.isSubmitting}
          loading={methods.formState.isSubmitting}
        >
          {t("submit")}
        </Button>
      </form>
    </FormProvider>
  );
}
