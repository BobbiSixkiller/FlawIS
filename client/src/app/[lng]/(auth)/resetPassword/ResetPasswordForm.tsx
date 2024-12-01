"use client";

import { useFormState } from "react-dom";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { useContext, useEffect, useState } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { resetPassword } from "./actions";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useValidation from "@/hooks/useValidation";
import { Input } from "@/components/Input";

export default function ResetPasswordForm({
  lng,
  token,
}: {
  lng: string;
  token?: string;
}) {
  const { t } = useTranslation(lng, "resetPassword");

  const { dispatch } = useContext(MessageContext);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        password: yup
          .string()
          .trim()
          .required()
          .matches(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s]{6,}$/,
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

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 mt-4"
        onSubmit={methods.handleSubmit(
          async ({ password }) => {
            const state = await resetPassword(password, token || "");

            if (state?.message && !state.success) {
              dispatch({
                type: ActionTypes.SetFormMsg,
                payload: state,
              });
            }
            if (state?.message && state.success) {
              dispatch({
                type: ActionTypes.SetAppMsg,
                payload: state,
              });
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
        />
        <Input
          name="confirmPass"
          label={t("repeatPass")}
          type="password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <Button
          color="primary"
          type="submit"
          fluid
          loadingText={t("submitting")}
        >
          {t("submit")}
        </Button>
      </form>
    </FormProvider>
  );
}
