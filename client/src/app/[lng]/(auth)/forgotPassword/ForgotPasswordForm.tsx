"use client";

import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { sendResetLink } from "./actions";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import useValidation from "@/hooks/useValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/Input";

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
        <Input name="email" label={t("email")} />

        <Button
          color="primary"
          type="submit"
          fluid
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting}
        >
          {t("submit")}
        </Button>
      </form>
    </FormProvider>
  );
}
