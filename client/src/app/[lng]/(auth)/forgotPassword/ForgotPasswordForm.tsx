"use client";

import { useFormState } from "react-dom";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { useContext, useEffect } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { sendResetLink } from "./actions";

export default function ForgotPasswordForm({ lng }: { lng: string }) {
  const [state, formAction] = useFormState(sendResetLink, {
    success: false,
    message: "",
  });

  const { t } = useTranslation(lng, "forgotPassword");

  const { dispatch } = useContext(MessageContext);

  useEffect(() => {
    if (state?.message) {
      dispatch({
        type: ActionTypes.SetFormMsg,
        payload: state,
      });
    }
  }, [state]);

  return (
    <form className="space-y-6 mt-4" action={formAction}>
      <div>
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

      <Button color="primary" type="submit" fluid>
        {t("submit")}
      </Button>
    </form>
  );
}
