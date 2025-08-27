"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useState } from "react";
import { resetPassword } from "./actions";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useValidation from "@/hooks/useValidation";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useMessageStore } from "@/stores/messageStore";

export default function ResetPasswordForm({
  lng,
  token,
}: {
  lng: string;
  token?: string;
}) {
  const { t } = useTranslation(lng, "resetPassword");

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        password: yup
          .string()
          .trim()
          .required()
          .matches(
            /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/,
            t("password", { ns: "validation" })
          ),
        confirmPass: yup
          .string()
          .trim()

          .required()
          .oneOf([yup.ref("password")], t("confirmPass", { ns: "validation" })),
      })
    ),
    defaultValues: { password: "", confirmPass: "" },
  });

  const [showPassword, setShowPassword] = useState(false);

  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 mt-4"
        onSubmit={methods.handleSubmit(
          async ({ password }) => {
            const res = await resetPassword({ password }, token || "");
            if (res) {
              setMessage(res.message, res.success);
            }
          },
          (err) => console.log(err)
        )}
      >
        <Input
          name="password"
          label={t("password")}
          type="password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          autoComplete="off"
        />
        <Input
          name="confirmPass"
          label={t("repeatPass")}
          type="password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          autoComplete="off"
        />

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
