"use client";

import { useTranslation } from "@/lib/i18n/client";
import { sendResetLink } from "./actions";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import useValidation from "@/hooks/useValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useMessageStore } from "@/stores/messageStore";

export default function ForgotPasswordForm() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "forgotPassword");

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({ email: yup.string().email().required() })
    ),
    defaultValues: { email: "" },
  });

  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 mt-4"
        onSubmit={methods.handleSubmit(async (val) => {
          const { message, success } = await sendResetLink(val.email);

          setMessage(message, success);
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
