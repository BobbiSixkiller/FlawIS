"use client";

import { useFormState } from "react-dom";
import { resetPassword } from "../actions";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import Message from "@/components/Message";
import { Trans } from "react-i18next";
import Link from "next/link";

export default function ResetPasswordForm({
  lng,
  token,
}: {
  lng: string;
  token?: string;
}) {
  const [state, formAction] = useFormState(resetPassword, {
    success: false,
    message: "",
  });

  const { t } = useTranslation(lng, "resetPassword");

  return (
    <form className="space-y-6" action={formAction}>
      {state.message && (
        <Message
          success={state.success}
          message={
            <Trans
              i18nKey={"forgotLink"}
              t={t}
              values={{ message: state.message }}
              components={{
                forgot: (
                  <Link
                    href="/forgotPassword"
                    className="font-semibold hover:text-red-700 hover:underline"
                  />
                ),
              }}
            />
          }
        />
      )}
      <input type="hidden" name="token" value={token} />
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("password")}
        </label>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("repeatPass")}
        </label>
        <div className="mt-2">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>

      <Button type="submit" loadingText={t("submitting")}>
        {t("submit")}
      </Button>
    </form>
  );
}
