"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { sendResetLink } from "./actions";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import useValidation from "@/hooks/useValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function ForgotPasswordForm() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "forgotPassword");

  const { dispatch } = useContext(MessageContext);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({ email: yup.string().email().required() })
    ),
    defaultValues: { email: "" },
  });

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 mt-4"
        onSubmit={methods.handleSubmit(async (val) => {
          const state = await sendResetLink(val.email);

          if (state?.message) {
            dispatch({
              type: ActionTypes.SetFormMsg,
              payload: state,
            });
          }
        })}
      >
        <Input name="email" label={t("email")} autoComplete="off" />

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
    </FormProvider>
  );
}
