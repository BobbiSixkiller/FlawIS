"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useFormState } from "react-dom";
import { login } from "../actions";
import { Trans } from "react-i18next";
import Link from "next/link";
import Button from "@/components/Button";
import { useContext, useEffect } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";

export default function LoginForm({ lng, url }: { lng: string; url?: string }) {
  const [state, formAction] = useFormState(login, {
    success: false,
    message: "",
  });

  const { t } = useTranslation(lng, "login");

  const { dispatch } = useContext(MessageContext);

  useEffect(() => {
    if (state.message) {
      dispatch({
        type: ActionTypes.SetMsg,
        payload: { content: state.message, positive: state.success },
      });
    }
  }, [state, dispatch]);

  return (
    <form className="space-y-6 mt-4" action={formAction}>
      <div>
        <input type="hidden" name="url" value={url} />
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("email")}
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
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
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
      <Button color="primary" type="submit" fluid loadingText={t("submitting")}>
        {t("submit")}
      </Button>
    </form>
  );
}
