"use client";

import Button from "@/components/Button";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useValidation from "@/hooks/useValidation";
import { Input } from "@/components/Input";
import { updateUser } from "./actions";
import { FormMessage } from "@/components/Message";

export default function UpdateProfileForm({
  lng,
  user,
}: {
  lng: string;
  user?: UserFragment;
}) {
  const router = useRouter();
  const { t } = useTranslation(lng, ["profile", "common"]);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
      })
    ),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
    },
  });

  const { dispatch } = useContext(MessageContext);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-80"
        onSubmit={methods.handleSubmit(async (val) => {
          const state = await updateUser(user?.id, val);

          if (!state.success) {
            dispatch({
              type: ActionTypes.SetFormMsg,
              payload: state,
            });
          }

          if (state.success) {
            dispatch({
              type: ActionTypes.SetAppMsg,
              payload: state,
            });
            router.back();
          }
        })}
      >
        <FormMessage />

        <Input label="Meno" name="name" />
        <Input label="Email" name="email" />

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
